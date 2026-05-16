import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

vi.mock('./lib/config', () => ({
  loadConfig: vi.fn(),
  resetConfigCache: vi.fn(),
}))

import { loadConfig } from './lib/config'
const mockLoadConfig = vi.mocked(loadConfig)

describe('App (process)', () => {
  beforeEach(() => { vi.restoreAllMocks() })

  it('shows not-configured message when isConfigured is false', async () => {
    mockLoadConfig.mockResolvedValue({
      deploymentId: 'test-id', appName: 'Process', orgName: 'Test', brandColour: '#6366f1',
      logoUrl: null, systemPrompt: '', capabilities: [], isConfigured: false,
    })
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('This app is not yet configured. Deploy it from Jobgraph to get started.')).toBeInTheDocument()
    })
  })

  it('renders extract button when configured', async () => {
    mockLoadConfig.mockResolvedValue({
      deploymentId: 'test-id', appName: 'Process', orgName: 'Test', brandColour: '#6366f1',
      logoUrl: null, systemPrompt: '', capabilities: [], isConfigured: true,
    })
    render(<App />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Extract data' })).toBeInTheDocument()
    })
  })

  it('renders app name in header when configured', async () => {
    mockLoadConfig.mockResolvedValue({
      deploymentId: 'test-id', appName: 'Process', orgName: 'Test', brandColour: '#6366f1',
      logoUrl: null, systemPrompt: '', capabilities: [], isConfigured: true,
    })
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('Process')).toBeInTheDocument()
    })
  })
})
