REVOKE EXECUTE ON FUNCTION public.is_community_member(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_community_admin(uuid, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_community_member(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_community_admin(uuid, uuid) TO authenticated, service_role;