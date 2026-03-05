<script lang="ts">
  import Self from '$lib/components/JsonSchemaConfig.svelte';
  import AlbumPickerModal from '$lib/modals/AlbumPickerModal.svelte';
  import type { JSONSchemaProperty } from '$lib/types';
  import { Button, Field, Input, Label, modalManager, NumberInput, Select, Switch, Text } from '@immich/ui';
  import { t } from 'svelte-i18n';

  type Props = {
    property: JSONSchemaProperty;
    key: string | 'root';
    config: any;
  };

  let { property, key, config = $bindable() }: Props = $props();

  const onPickAlbum = async () => {
    const albums = await modalManager.show(AlbumPickerModal);
    if (!albums || albums.length === 0) {
      return;
    }

    setValue(albums[0].id);
  };

  const getBoolean = (defaultValue = false) => getValue<boolean>(defaultValue);
  const getString = () => getValue<string>();
  const getNumber = () => getValue<number>();

  const getValue = <T,>(defaultValue?: T) => {
    return (key === 'root' ? config : (config?.[key] ?? defaultValue)) as T;
  };
  const setValue = <T,>(value: T) => {
    if (key === 'root') {
      config = value;
    } else {
      if (config === undefined) {
        config = {};
      }

      config[key] = value;
    }
  };
</script>

<!-- nested configuration (also top level objects) -->
{#if property.type === 'object'}
  {#if key !== 'root'}
    <div class="flex flex-col gap-2">
      <Label size="small" class="font-medium" label={property.title ?? key}></Label>
      {#if property.description}
        <Text color="muted" size="small">{property.description}</Text>
      {/if}
    </div>
  {/if}
  <div class="flex flex-col gap-2 {key === 'root' ? '' : 'ps-2 border-l-3 border-primary-200'}">
    {#each Object.entries(property.properties ?? {}) as [childKey, childProperty], i (i)}
      <Self property={childProperty} key={childKey} bind:config={getValue, setValue} />
    {/each}
  </div>
{:else if property.array}
  <Field label={property.title ?? key} description={property.description}>
    <Text>Arrays are not yet supported</Text>
  </Field>
{:else if property.enum}
  <Field label={property.title ?? key} description={property.description}>
    <Select options={property.enum} bind:value={getString, setValue} />
  </Field>
{:else if property.type === 'boolean'}
  <Field label={property.title ?? key} description={property.description}>
    <Switch bind:checked={() => getBoolean(property.default ?? false), setValue} />
  </Field>
{:else if property.type === 'number'}
  <Field label={property.title ?? key} description={property.description}>
    <NumberInput bind:value={getNumber, setValue} />
  </Field>
{:else if property.type === 'string'}
  {#if property.uiHint === 'albumId'}
    {@const albumId = getString()}
    {#if albumId}
      <Field label={property.title ?? key} description={property.description}>
        <Input value={albumId} readonly />
      </Field>
    {:else}
      <div class="flex flex-col gap-2">
        <Label for="album-picker" size="small" class="font-medium" label={$t('album')}></Label>
        {#if property.description}
          <Text color="muted" size="small">{property.description}</Text>
        {/if}
        <Button id="album-picker" size="small" color="secondary" onclick={onPickAlbum}>{$t('select_album')}</Button>
      </div>
    {/if}
  {:else}
    <Field label={property.title ?? key} description={property.description}>
      <Input bind:value={() => getValue<string>(), setValue} />
    </Field>
  {/if}
{:else}
  <Text>Unsupported configuration</Text>
{/if}
