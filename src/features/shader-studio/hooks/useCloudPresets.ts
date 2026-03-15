import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StudioState } from '../types';

export interface CloudPreset {
  id: string;
  name: string;
  state: StudioState;
  created_at: string;
}

export function useCloudPresets() {
  const [presets, setPresets] = useState<CloudPreset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPresets = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shader_presets')
      .select('id, name, state, created_at')
      .order('name');

    if (!error && data) {
      setPresets(data.map((row: any) => ({
        id: row.id,
        name: row.name,
        state: row.state as StudioState,
        created_at: row.created_at,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPresets(); }, [fetchPresets]);

  const savePreset = useCallback(async (name: string, state: StudioState) => {
    const payload = {
      name,
      state: state as any,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('shader_presets')
      .upsert(payload, { onConflict: 'name' });

    if (!error) await fetchPresets();
    return !error;
  }, [fetchPresets]);

  const deletePreset = useCallback(async (name: string) => {
    const { error } = await supabase
      .from('shader_presets')
      .delete()
      .eq('name', name);

    if (!error) await fetchPresets();
    return !error;
  }, [fetchPresets]);

  const loadPreset = useCallback((name: string): StudioState | null => {
    const found = presets.find((p) => p.name === name);
    return found?.state ?? null;
  }, [presets]);

  return {
    presets,
    presetNames: presets.map((p) => p.name),
    loading,
    savePreset,
    deletePreset,
    loadPreset,
    refetch: fetchPresets,
  };
}
