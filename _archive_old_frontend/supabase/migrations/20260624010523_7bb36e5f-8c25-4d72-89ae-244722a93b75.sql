REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE POLICY "Owners can delete their files in parceiros"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'parceiros' AND (auth.uid())::text = (storage.foldername(name))[1]);