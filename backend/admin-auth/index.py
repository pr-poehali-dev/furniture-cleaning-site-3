import json
import os

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def handler(event: dict, context) -> dict:
    """Проверяет пароль администратора и возвращает токен сессии. v2"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    password = body.get('password', '')

    if password == os.environ.get('ADMIN_PASSWORD', ''):
        return {
            'statusCode': 200,
            'headers': CORS,
            'body': json.dumps({'ok': True, 'token': password}),
        }

    return {
        'statusCode': 401,
        'headers': CORS,
        'body': json.dumps({'ok': False, 'error': 'Неверный пароль'}),
    }