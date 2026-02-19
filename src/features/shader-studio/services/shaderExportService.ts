export function exportShaderSource(fragmentShader: string, filename = 'shader.frag') {
  const blob = new Blob([fragmentShader], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
