CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role, postgres;

ALTER FUNCTION public.is_community_member(uuid, uuid) SET SCHEMA private;
ALTER FUNCTION public.is_community_admin(uuid, uuid) SET SCHEMA private;

ALTER FUNCTION private.is_community_member(uuid, uuid) SET search_path = public;
ALTER FUNCTION private.is_community_admin(uuid, uuid) SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;