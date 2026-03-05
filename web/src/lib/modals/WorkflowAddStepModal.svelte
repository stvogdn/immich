<script lang="ts">
  import JsonSchemaConfig from '$lib/components/JsonSchemaConfig.svelte';
  import PluginMethodPicker from '$lib/modals/PluginMethodPicker.svelte';
  import { type JSONSchemaProperty } from '$lib/types';
  import { WorkflowTrigger, type PluginMethodResponseDto, type WorkflowStepResponseDto } from '@immich/sdk';
  import { Field, FormModal, IconButton, modalManager, Stack, Text, Textarea } from '@immich/ui';
  import { mdiPencilOutline } from '@mdi/js';
  import { t } from 'svelte-i18n';

  type Props = {
    trigger: WorkflowTrigger;
    onClose: (step?: WorkflowStepResponseDto) => void;
  };

  const { trigger, onClose }: Props = $props();

  const onSubmit = () => {
    if (method) {
      onClose({ method: method.key, config });
    }
  };

  let method = $state<PluginMethodResponseDto>();
  let config = $state<unknown>({});

  const onPickMethod = async () => {
    const selected = await modalManager.show(PluginMethodPicker, { trigger, selectedKey: method?.key });
    if (!selected) {
      return;
    }

    method = selected;
    config = selected.schema ? {} : null;
  };

  void onPickMethod();
</script>

{#if method}
  <FormModal title={$t('add_step')} {onClose} {onSubmit} disabled={!method} size="medium">
    <Stack gap={4}>
      <div class="flex justify-between items-center gap-2">
        <div class="text-start grow">
          <Text fontWeight="medium">{method.title}</Text>
          {#if method.description}
            <Text size="tiny" color="muted">{method.description}</Text>
          {/if}
        </div>
        <IconButton
          icon={mdiPencilOutline}
          size="small"
          color="secondary"
          variant="ghost"
          shape="round"
          onclick={onPickMethod}
          aria-label={$t('edit')}
        />
      </div>

      <hr class="my-2 border border-light-200" />

      <div class="text-start grow">
        <Stack gap={4}>
          {#if method.schema}
            <JsonSchemaConfig property={method.schema as JSONSchemaProperty} key="root" bind:config />
            <Field label={$t('preview')}>
              <Textarea readonly grow value={JSON.stringify({ method: method.key, config }, null, 2)} />
            </Field>
          {:else}
            <Text size="tiny" color="muted">{$t('no_configuration_needed')}</Text>
          {/if}
        </Stack>
      </div>
    </Stack>
  </FormModal>
{/if}
