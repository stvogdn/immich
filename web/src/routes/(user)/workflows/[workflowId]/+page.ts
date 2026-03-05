import { pluginManager } from '$lib/managers/plugin-manager.svelte';
import { authenticate } from '$lib/utils/auth';
import { getFormatter } from '$lib/utils/i18n';
import { getWorkflow, getWorkflowTriggers } from '@immich/sdk';
import type { PageLoad } from './$types';

export const load = (async ({ url, params }) => {
  await authenticate(url);
  const [workflow, triggers] = await Promise.all([
    getWorkflow({ id: params.workflowId }),
    getWorkflowTriggers(),
    pluginManager.ready(),
  ]);
  const $t = await getFormatter();

  return {
    workflow,
    triggers,
    meta: {
      title: $t('edit_workflow'),
    },
  };
}) satisfies PageLoad;
