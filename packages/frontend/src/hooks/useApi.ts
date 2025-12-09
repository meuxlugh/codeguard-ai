import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../lib/api';
import type { FileIssues } from '../lib/api';

export function useRepos() {
  return useQuery({
    queryKey: ['repos'],
    queryFn: api.fetchRepos,
    refetchInterval: 5000, // Poll every 5 seconds to update status
  });
}

export function useRepo(id: string | undefined) {
  return useQuery({
    queryKey: ['repos', id],
    queryFn: () => api.fetchRepo(id!),
    enabled: !!id,
    refetchInterval: 5000, // Poll while analyzing
  });
}

export function useFiles(repoId: string | undefined) {
  return useQuery({
    queryKey: ['files', repoId],
    queryFn: () => api.fetchFiles(repoId!),
    enabled: !!repoId,
  });
}

export function useFileContent(repoId: string | undefined, path: string | null) {
  return useQuery({
    queryKey: ['fileContent', repoId, path],
    queryFn: () => api.fetchFileContent(repoId!, path!),
    enabled: !!repoId && !!path,
  });
}

export function useIssues(repoId: string | undefined) {
  return useQuery({
    queryKey: ['issues', repoId],
    queryFn: () => api.fetchIssues(repoId!),
    enabled: !!repoId,
  });
}

export function useIssuesByFile(repoId: string | undefined) {
  return useQuery<FileIssues[]>({
    queryKey: ['issuesByFile', repoId],
    queryFn: () => api.fetchIssuesByFile(repoId!),
    enabled: !!repoId,
  });
}

export function useCreateRepo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createRepo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repos'] });
    },
  });
}

export function useRecheckRepo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api.recheckRepo(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['repos'] });
      queryClient.invalidateQueries({ queryKey: ['repos', String(data.id)] });
      queryClient.invalidateQueries({ queryKey: ['issues', String(data.id)] });
      queryClient.invalidateQueries({ queryKey: ['issuesByFile', String(data.id)] });
    },
  });
}

export function useDeleteRepo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api.deleteRepo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repos'] });
    },
  });
}
