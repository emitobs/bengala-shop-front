import { useQuery } from '@tanstack/react-query';
import { getActiveBannersApi } from '@/api/banners.api';

export function useBanners() {
  return useQuery({
    queryKey: ['banners'],
    queryFn: getActiveBannersApi,
    staleTime: 1000 * 60 * 5,
  });
}
