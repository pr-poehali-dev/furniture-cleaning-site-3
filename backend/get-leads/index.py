import json
import os
import psycopg2
import psycopg2.extras

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
}

def check_auth(event: dict) -> bool:
    params = event.get('queryStringParameters') or {}
    token = params.get('token', '') or event.get('headers', {}).get('x-admin-token', '')
    return token == os.environ.get('ADMIN_PASSWORD', '')

def handler(event: dict, context) -> dict:
    """CRM и управление услугами/ценами для панели администратора. Параметр scope=services для работы с услугами."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    scope = params.get('scope', 'leads')

    # Публичный доступ к услугам (для главной страницы)
    if scope == 'services' and event.get('httpMethod') == 'GET' and not params.get('token'):
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT id, name, price, sort_order, is_active FROM services WHERE is_active = TRUE ORDER BY sort_order ASC, id ASC")
        rows = [dict(r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'services': rows})}

    if not check_auth(event):
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Unauthorized'})}

    method = event.get('httpMethod', 'GET')
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    def serialize_service(r):
        row = dict(r)
        row.pop('created_at', None)
        return row

    # --- УСЛУГИ ---
    if scope == 'services':
        if method == 'GET':
            cur.execute("SELECT * FROM services ORDER BY sort_order ASC, id ASC")
            rows = [serialize_service(r) for r in cur.fetchall()]
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'services': rows})}

        body = json.loads(event.get('body') or '{}')

        if method == 'POST':
            name = body.get('name', '').strip()
            price = body.get('price', '').strip()
            sort_order = body.get('sort_order', 0)
            if not name or not price:
                cur.close()
                conn.close()
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'name and price required'})}
            cur.execute(
                "INSERT INTO services (name, price, sort_order) VALUES (%s, %s, %s) RETURNING *",
                (name, price, sort_order)
            )
            row = serialize_service(cur.fetchone())
            conn.commit()
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'service': row})}

        if method == 'PUT':
            service_id = body.get('id')
            name = body.get('name', '').strip()
            price = body.get('price', '').strip()
            is_active = body.get('is_active', True)
            sort_order = body.get('sort_order', 0)
            cur.execute(
                "UPDATE services SET name=%s, price=%s, is_active=%s, sort_order=%s WHERE id=%s",
                (name, price, is_active, sort_order, service_id)
            )
            conn.commit()
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        if method == 'DELETE':
            service_id = body.get('id')
            cur.execute("DELETE FROM services WHERE id=%s", (service_id,))
            conn.commit()
            cur.close()
            conn.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    # --- ЗАЯВКИ (leads) ---
    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        lead_id = body.get('id')
        status = body.get('status')
        if lead_id and status:
            cur.execute("UPDATE leads SET status = %s WHERE id = %s", (status, lead_id))
            conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    cur.execute("SELECT * FROM leads ORDER BY created_at DESC")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    leads = []
    for r in rows:
        row = dict(r)
        row['created_at'] = row['created_at'].isoformat()
        leads.append(row)

    return {
        'statusCode': 200,
        'headers': CORS,
        'body': json.dumps({'leads': leads}),
    }