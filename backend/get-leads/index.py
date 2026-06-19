import json
import os
import psycopg2
import psycopg2.extras

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
}

def check_auth(event: dict) -> bool:
    token = event.get('headers', {}).get('x-admin-token', '')
    return token == os.environ.get('ADMIN_PASSWORD', '')

def handler(event: dict, context) -> dict:
    """Возвращает список заявок для панели администратора. Требует заголовок X-Admin-Token. v2"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    if not check_auth(event):
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Unauthorized'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    method = event.get('httpMethod', 'GET')

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