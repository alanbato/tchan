from uchan import g
from uchan.lib.cache import CacheDict
from uchan.lib.configs import SiteConfig


class SiteCache:
    SITE_CONFIG_TIMEOUT = 24 * 60 * 60

    def __init__(self, cache):
        self.cache = cache

    def find_site_config_cached(self):
        site_config_cache = self.cache.get('config_site', True)
        if site_config_cache is None:
            site_config = g.config_service.get_config_by_type(SiteConfig.TYPE)
            site_config_cache = CacheDict(g.config_service.load_config_dict(site_config)).convert()

            self.cache.set('config_site', site_config_cache, timeout=self.SITE_CONFIG_TIMEOUT)
        return site_config_cache

    def invalidate_site_config(self):
        self.cache.delete('config_site')