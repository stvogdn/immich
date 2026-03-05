import { goto } from '$app/navigation';
import { eventManager } from '$lib/managers/event-manager.svelte';
import { Route } from '$lib/route';
import { handleError } from '$lib/utils/handle-error';
import { getFormatter } from '$lib/utils/i18n';
import {
  createWorkflow,
  deleteWorkflow,
  getAlbumInfo,
  getPerson,
  updateWorkflow,
  WorkflowTrigger,
  type AlbumResponseDto,
  type PersonResponseDto,
  type WorkflowCreateDto,
  type WorkflowResponseDto,
  type WorkflowUpdateDto,
} from '@immich/sdk';
import { modalManager, toastManager, type ActionItem } from '@immich/ui';
import { mdiCodeJson, mdiDelete, mdiPause, mdiPencil, mdiPlay, mdiPlus } from '@mdi/js';
import type { MessageFormatter } from 'svelte-i18n';

export type PickerSubType = 'album-picker' | 'people-picker';
export type PickerMetadata = AlbumResponseDto | PersonResponseDto | AlbumResponseDto[] | PersonResponseDto[];

export const handleUpdateWorkflow = async (id: string, dto: WorkflowUpdateDto) => {
  const $t = await getFormatter();

  try {
    const response = await updateWorkflow({ id, workflowUpdateDto: dto });
    eventManager.emit('WorkflowUpdate', response);
    toastManager.success($t('workflow_update_success'), { closable: true });
  } catch (error) {
    handleError(error, $t('errors.something_went_wrong'));
  }
};

export const getWorkflowsActions = ($t: MessageFormatter) => {
  const Create: ActionItem = {
    title: $t('create_workflow'),
    icon: mdiPlus,
    onAction: () =>
      handleCreateWorkflow({
        trigger: WorkflowTrigger.AssetCreate,
        steps: [],
        enabled: false,
      }),
  };

  return { Create };
};

export const getWorkflowActions = ($t: MessageFormatter, workflow: WorkflowResponseDto) => {
  const ToggleEnabled: ActionItem = {
    title: workflow.enabled ? $t('disable') : $t('enable'),
    icon: workflow.enabled ? mdiPause : mdiPlay,
    color: workflow.enabled ? 'danger' : 'primary',
    onAction: async () => {
      await handleToggleWorkflowEnabled(workflow);
    },
  };

  const Edit: ActionItem = {
    title: $t('edit'),
    icon: mdiPencil,
    onAction: () => goto(Route.viewWorkflow(workflow)),
  };

  const Delete: ActionItem = {
    title: $t('delete'),
    icon: mdiDelete,
    color: 'danger',
    onAction: async () => {
      await handleDeleteWorkflow(workflow);
    },
  };

  return { ToggleEnabled, Edit, Delete };
};

export const getWorkflowShowSchemaAction = (
  $t: MessageFormatter,
  isExpanded: boolean,
  onToggle: () => void,
): ActionItem => ({
  title: isExpanded ? $t('hide_schema') : $t('show_schema'),
  icon: mdiCodeJson,
  onAction: onToggle,
});

const handleCreateWorkflow = async (dto: WorkflowCreateDto) => {
  const $t = await getFormatter();

  try {
    const response = await createWorkflow({ workflowCreateDto: dto });
    eventManager.emit('WorkflowCreate', response);
  } catch (error) {
    handleError(error, $t('errors.unable_to_create'));
  }
};

export const handleToggleWorkflowEnabled = async (
  workflow: WorkflowResponseDto,
): Promise<WorkflowResponseDto | undefined> => {
  const $t = await getFormatter();

  try {
    const updated = await updateWorkflow({
      id: workflow.id,
      workflowUpdateDto: { enabled: !workflow.enabled },
    });

    eventManager.emit('WorkflowUpdate', updated);
    toastManager.success();
    return updated;
  } catch (error) {
    handleError(error, $t('errors.unable_to_update_workflow'));
  }
};

export const handleDeleteWorkflow = async (workflow: WorkflowResponseDto): Promise<boolean> => {
  const $t = await getFormatter();

  const confirmed = await modalManager.showDialog({
    prompt: $t('workflow_delete_prompt'),
    confirmColor: 'danger',
  });

  if (!confirmed) {
    return false;
  }

  try {
    await deleteWorkflow({ id: workflow.id });
    eventManager.emit('WorkflowDelete', workflow);
    toastManager.success($t('workflow_deleted'));
    return true;
  } catch (error) {
    handleError(error, $t('errors.unable_to_delete_workflow'));
    return false;
  }
};

export const fetchPickerMetadata = async (
  value: string | string[] | undefined,
  subType: PickerSubType,
): Promise<PickerMetadata | undefined> => {
  if (!value) {
    return undefined;
  }

  const isAlbum = subType === 'album-picker';

  try {
    if (Array.isArray(value) && value.length > 0) {
      // Multiple selection
      return isAlbum
        ? await Promise.all(value.map((id) => getAlbumInfo({ id })))
        : await Promise.all(value.map((id) => getPerson({ id })));
    } else if (typeof value === 'string' && value) {
      // Single selection
      return isAlbum ? await getAlbumInfo({ id: value }) : await getPerson({ id: value });
    }
  } catch (error) {
    console.error(`Failed to fetch picker metadata:`, error);
  }

  return undefined;
};
