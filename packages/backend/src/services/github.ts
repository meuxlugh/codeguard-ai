import simpleGit from 'simple-git';

export async function cloneRepository(githubUrl: string, targetPath: string): Promise<void> {
  const git = simpleGit();

  try {
    // Shallow clone: only latest commit, single branch (most efficient)
    await git.clone(githubUrl, targetPath, ['--depth', '1', '--single-branch']);
    console.log(`Successfully cloned ${githubUrl} to ${targetPath}`);
  } catch (error) {
    console.error(`Failed to clone ${githubUrl}:`, error);
    throw new Error(`Failed to clone repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function pullRepository(repoPath: string): Promise<void> {
  const git = simpleGit(repoPath);

  try {
    // For shallow clones, fetch latest and reset to ensure fully up to date
    await git.fetch(['--depth', '1', 'origin']);
    await git.reset(['--hard', 'origin/HEAD']);
    console.log(`Successfully updated ${repoPath} to latest`);
  } catch (error) {
    console.error(`Failed to update ${repoPath}:`, error);
    throw new Error(`Failed to update repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getDefaultBranch(repoPath: string): Promise<string> {
  const git = simpleGit(repoPath);

  try {
    const branches = await git.branch();
    return branches.current;
  } catch (error) {
    console.error(`Failed to get default branch for ${repoPath}:`, error);
    return 'main'; // fallback
  }
}
