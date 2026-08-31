import redis
import os

_redis_client = None


def get_redis():
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis.from_url(
                os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
            )
            _redis_client.ping()
        except Exception:
            _redis_client = None
    return _redis_client


def cache_get(key):
    r = get_redis()
    if r is None:
        return None
    try:
        return r.get(key)
    except Exception:
        return None


def cache_set(key, value, expire=300):
    r = get_redis()
    if r is None:
        return
    try:
        r.setex(key, expire, value)
    except Exception:
        pass


def cache_delete_pattern(prefix):
    r = get_redis()
    if r is None:
        return
    try:
        for k in r.scan_iter(f'{prefix}*'):
            r.delete(k)
    except Exception:
        pass
