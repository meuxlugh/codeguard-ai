import { useQuery } from '@tanstack/react-query';
import * as publicApi from '../lib/api/public';
import type { FileIssues } from '../lib/api/public';

export function usePublicRepo(token: string | undefined) {
  return useQuery({
    queryKey: ['public', 'repo', token],
    queryFn: () => publicApi.fetchPublicRepo(token!),
    enabled: !!token,
    retry: false, // Don't retry on 404/410
  });
}

export function usePublicFiles(token: string | undefined) {
  return useQuery({
    queryKey: ['public', 'files', token],
    queryFn: () => publicApi.fetchPublicFiles(token!),
    enabled: !!token,
  });
}

export function usePublicFileContent(token: string | undefined, path: string | null) {
  return useQuery({
    queryKey: ['public', 'fileContent', token, path],
    queryFn: () => publicApi.fetchPublicFileContent(token!, path!),
    enabled: !!token && !!path,
  });
}

export function usePublicIssues(token: string | undefined) {
  return useQuery({
    queryKey: ['public', 'issues', token],
    queryFn: () => publicApi.fetchPublicIssues(token!),
    enabled: !!token,
  });
}

export function usePublicIssuesByFile(token: string | undefined) {
  return useQuery<FileIssues[]>({
    queryKey: ['public', 'issuesByFile', token],
    queryFn: () => publicApi.fetchPublicIssuesByFile(token!),
    enabled: !!token,
  });
}
