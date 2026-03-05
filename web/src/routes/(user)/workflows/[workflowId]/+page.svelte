<script lang="ts">
  import { goto } from '$app/navigation';
  import OnEvents from '$lib/components/OnEvents.svelte';
  import ControlAppBar from '$lib/components/shared-components/control-app-bar.svelte';
  import { pluginManager } from '$lib/managers/plugin-manager.svelte';
  import WorkflowAddStepModal from '$lib/modals/WorkflowAddStepModal.svelte';
  import { Route } from '$lib/route';
  import { handleUpdateWorkflow } from '$lib/services/workflow.service';
  import type { WorkflowResponseDto } from '@immich/sdk';
  import {
    Button,
    Card,
    CardBody,
    CardDescription,
    CardHeader,
    CardTitle,
    Container,
    Field,
    HStack,
    Icon,
    Input,
    modalManager,
    Stack,
    Switch,
    Text,
    Textarea,
    VStack,
  } from '@immich/ui';
  import {
    mdiArrowLeft,
    mdiContentSave,
    mdiFlashOutline,
    mdiFormatListBulletedSquare,
    mdiInformationOutline,
    mdiPlus,
  } from '@mdi/js';
  import { t } from 'svelte-i18n';
  import type { PageData } from './$types';

  type Props = {
    data: PageData;
  };

  let { data }: Props = $props();

  const triggers = data.triggers;

  let workflow = $state(data.workflow);

  let selectedTrigger = $state(triggers.find((t) => t.trigger === workflow.trigger) ?? triggers[0]);

  const handleAddStep = async () => {
    const step = await modalManager.show(WorkflowAddStepModal, { trigger: workflow.trigger });
    if (step) {
      workflow.steps = [...workflow.steps, step];
    }
  };

  const onSave = async () =>
    handleUpdateWorkflow(workflow.id, {
      name: workflow.name,
      description: workflow.description,
      enabled: workflow.enabled,
      trigger: workflow.trigger,
      steps: workflow.steps,
    });

  const onWorkflowUpdate = (response: WorkflowResponseDto) => {
    if (workflow.id === response.id) {
      workflow = response;
    }
  };
</script>

<svelte:head>
  <title>{data.meta.title} - Immich</title>
</svelte:head>

<OnEvents {onWorkflowUpdate} />

<main class="pt-24 immich-scrollbar">
  <Container size="medium" class="p-4" center>
    <VStack gap={4}>
      <Card expandable>
        <CardHeader>
          <div class="flex place-items-start gap-3">
            <Icon icon={mdiInformationOutline} size="20" class="mt-1" />
            <div class="flex flex-col">
              <CardTitle>
                {$t('workflow_info')}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <VStack gap={4}>
            <div class="relative overflow-hidden border p-4 w-full rounded-xl" class:bg-primary-50={workflow.enabled}>
              <Field
                label={workflow.enabled ? $t('enabled') : $t('disabled')}
                color={workflow.enabled ? 'primary' : 'secondary'}
              >
                <Switch bind:checked={workflow.enabled} />
              </Field>
            </div>

            <Field label={$t('name')} required>
              <Input
                placeholder={$t('workflow_name')}
                bind:value={() => workflow.name ?? '', (value) => (workflow.name = value || null)}
              />
            </Field>
            <Field label={$t('description')} for="workflow-description">
              <Textarea
                id="workflow-description"
                grow
                placeholder={$t('workflow_description')}
                bind:value={() => workflow.description ?? '', (value) => (workflow.description = value || null)}
              />
            </Field>
          </VStack>
        </CardBody>
      </Card>

      <div class="my-4 h-px w-[98%] bg-light-200"></div>

      <Card>
        <CardHeader class="bg-success-50">
          <div class="flex items-start gap-3">
            <Icon icon={mdiFlashOutline} size="20" class="mt-1 text-success" />
            <div class="flex flex-col">
              <CardTitle class="text-left text-success">{$t('trigger')}</CardTitle>
              <CardDescription>{$t('trigger_description')}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <div class="grid grid-cols-2 gap-4">
            {#each triggers as item (item.trigger)}
              <Text>{item.trigger}</Text>
            {/each}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader class="bg-primary-50">
          <div class="flex items-start gap-3">
            <Icon icon={mdiFormatListBulletedSquare} size="20" class="mt-1 text-primary" />
            <CardTitle class="text-left text-primary">{$t('steps')}</CardTitle>
          </div>
        </CardHeader>

        <CardBody>
          {#if workflow.steps.length === 0}
            <Button leadingIcon={mdiPlus} onclick={handleAddStep}>{$t('add_step')}</Button>
          {:else}
            <Stack gap={2}>
              {#each workflow.steps as step, index (index)}
                {#if index > 0}
                  <hr />
                {/if}
                <div
                  // {@attach dragAndDrop({
                  //   index,
                  //   onDragStart: handleFilterDragStart,
                  //   onDragEnter: handleFilterDragEnter,
                  //   onDrop: handleFilterDrop,
                  //   onDragEnd: handleFilterDragEnd,
                  //   isDragging: draggedIndex === index,
                  //   isDragOver: dragOverIndex === index,
                  // })}
                  class="cursor-move rounded-2xl border-2 p-4 transition-all bg-light-50 border-dashed hover:border-light-300"
                >
                  <Text>{pluginManager.getMethodLabel(step.method)}</Text>
                </div>
              {/each}

              <Button size="small" fullWidth variant="ghost" leadingIcon={mdiPlus} onclick={handleAddStep}>
                {$t('add_step')}
              </Button>
            </Stack>
          {/if}
        </CardBody>
      </Card>
    </VStack>
  </Container>
</main>

<ControlAppBar onClose={() => goto(Route.workflows())} backIcon={mdiArrowLeft} tailwindClasses="fixed! top-0! w-full">
  {#snippet leading()}
    <Text>{data.meta.title}</Text>
  {/snippet}

  {#snippet trailing()}
    <HStack gap={4}>
      <Button leadingIcon={mdiContentSave} size="small" color="primary" onclick={onSave}>
        {$t('save')}
      </Button>
    </HStack>
  {/snippet}
</ControlAppBar>
