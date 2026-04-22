import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useChatFormContext } from '~/Providers';
import { useAgentsMapContext } from '~/Providers/AgentsMapContext';
import { useChatContext } from '~/Providers/ChatContext';
import { useAuthContext } from '~/hooks/AuthContext';
import { useLocalize } from '~/hooks';

interface PPMProject {
  code: string;
  name: string;
}

interface PPMTask {
  id: number | string;
  name: string;
}

async function fetchPPMProjects(token: string): Promise<PPMProject[]> {
  const res = await fetch('/api/ppm/projects', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function fetchPPMTasks(token: string, projectCode: string): Promise<PPMTask[]> {
  const res = await fetch(`/api/ppm/tasks?projectCode=${encodeURIComponent(projectCode)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function PPMFields() {
  const { conversation } = useChatContext();
  const agentsMap = useAgentsMapContext();
  const methods = useChatFormContext();
  const { token, user } = useAuthContext();
  const localize = useLocalize();

  const agentName = agentsMap?.[conversation?.agent_id ?? '']?.name;
  const isPPM = agentName === 'PPM';

  const [selectedProject, setSelectedProject] = useState<PPMProject | null>(null);
  const [selectedTask, setSelectedTask] = useState<PPMTask | null>(null);

  const {
    data: projects = [],
    isLoading: projectsLoading,
  } = useQuery({
    queryKey: ['ppm-projects', user?.id],
    queryFn: () => fetchPPMProjects(token ?? ''),
    enabled: isPPM && !!token,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: ['ppm-tasks', user?.id, selectedProject?.code],
    queryFn: () => fetchPPMTasks(token ?? '', selectedProject!.code),
    enabled: isPPM && selectedProject != null && !!token,
    staleTime: 2 * 60 * 1000,
  });

  const handleProjectChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const code = e.target.value;
      const project = projects.find((p) => p.code === code) ?? null;
      setSelectedProject(project);
      setSelectedTask(null);
    },
    [projects],
  );

  const handleTaskChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value;
      const task = tasks.find((t) => String(t.id) === id) ?? null;
      setSelectedTask(task);
    },
    [tasks],
  );

  const insertIntoText = useCallback(() => {
    if (!selectedProject) return;
    const current = methods.getValues('text') ?? '';
    const separator = current.length > 0 && !current.endsWith(' ') ? ' ' : '';
    const isAdmin = selectedProject.code === 'administrativ';
    let insertion = isAdmin ? 'Administrative' : `PROJECT: ${selectedProject.code}`;
    if (selectedTask) {
      insertion += `, TASK:${selectedTask.name}`;
    }
    methods.setValue('text', current + separator + insertion, { shouldValidate: true });
  }, [selectedProject, selectedTask, methods]);

  if (!isPPM) return null;

  const selectClass =
    'h-7 cursor-pointer appearance-none rounded-2xl border border-border-medium bg-surface-secondary px-3 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="flex items-center gap-1.5">
      <select
        aria-label="Select project"
        className={selectClass}
        value={selectedProject?.code ?? ''}
        onChange={handleProjectChange}
        disabled={projectsLoading}
      >
        <option value="">{projectsLoading ? localize('com_ui_loading') : localize('com_ui_ppm_project')}</option>
        {projects.map((p) => (
          <option key={p.code} value={p.code}>
            {p.name}
          </option>
        ))}
      </select>

      <select
        aria-label="Select task"
        className={selectClass}
        value={selectedTask ? String(selectedTask.id) : ''}
        onChange={handleTaskChange}
        disabled={!selectedProject || tasksLoading}
      >
        {!selectedProject ? (
          <option value="">{localize('com_ui_ppm_select_project_first')}</option>
        ) : tasksError ? (
          <option value="">{localize('com_ui_ppm_failed_tasks')}</option>
        ) : (
          <>
            <option value="">{tasksLoading ? localize('com_ui_loading') : tasks.length === 0 ? localize('com_ui_ppm_no_tasks') : localize('com_ui_ppm_task')}</option>
            {tasks.map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.name}
              </option>
            ))}
          </>
        )}
      </select>

      {selectedProject && (
        <button
          type="button"
          onClick={insertIntoText}
          className="h-7 rounded-2xl border border-border-medium bg-surface-secondary px-3 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary active:scale-95"
        >
          + {localize('com_ui_add')}
        </button>
      )}
    </div>
  );
}
