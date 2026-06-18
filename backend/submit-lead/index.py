import json
import os
import psycopg2
import urllib.request

def send_telegram(text: str):
    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '')
    if not token or not chat_id:
        return
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    data = json.dumps({"chat_id": chat_id, "text": text, "parse_mode": "HTML"}).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    urllib.request.urlopen(req, timeout=5)

def handler(event: dict, context) -> dict:
    """Принимает заявку с сайта, сохраняет в БД и отправляет уведомление в Telegram."""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    name = body.get('name', '').strip()
    phone = body.get('phone', '').strip()
    comment = body.get('comment', '').strip()
    source = body.get('source', 'form').strip()
    furniture = body.get('furniture', '').strip()

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO leads (name, phone, comment, source, furniture) VALUES (%s, %s, %s, %s, %s) RETURNING id",
        (name or None, phone or None, comment or None, source, furniture or None)
    )
    lead_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    source_label = {
        'form': 'Форма заявки',
        'whatsapp': 'WhatsApp',
        'telegram': 'Telegram',
        'furniture_picker': 'Подборщик мебели',
    }.get(source, source)

    lines = [f"🆕 <b>Новая заявка #{lead_id}</b>", f"Источник: {source_label}"]
    if name:
        lines.append(f"Имя: {name}")
    if phone:
        lines.append(f"Телефон: {phone}")
    if furniture:
        lines.append(f"Мебель: {furniture}")
    if comment:
        lines.append(f"Комментарий: {comment}")

    try:
        send_telegram("\n".join(lines))
    except Exception:
        pass

    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({'ok': True, 'id': lead_id}),
    }
