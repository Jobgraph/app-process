import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

vi.mock('./config', () => ({
  loadConfig: vi.fn(),
}))

import { loadConfig } from './config'
const mockLoadConfig = vi.mocked(loadConfig)

describe('App (process)', () => {
  beforeEach(() => { vi.restoreAllMocks() })

  it('shows not-configured message when isConfigured is false', async () => {
    mockLoadConfig.mockResolvedValue({
      deploymentId: 'local', appName: 'Process', orgName: 'Test', brandColour: '#6366f1',
      logoUrl: null, systemPrompt: '', capabilities: [], isConfigured: false,
    })
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText('This app is not configured. Deploy it from Jobgraph to get started.')).toBeInTheDocument()
    })
  })

  it('renders paste area with disabled button when empty', async () => {
    mockLoadConfig.mockResolvedValue({
      deploymentId: 'test-id', appName: 'Process', orgName: 'Test', brandColour: '#6366f1',
      logoUrl: null, systemPrompt: '', capabilities: [], isConfigured: true,
    })
    render(<App />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Paste a document, email, or form content here...')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Extract data' })).toBeDisabled()
  })

  it('renders key-value table after successful extraction', async () => {
    mockLoadConfig.mockResolvedValue({
      deploymentId: 'test-id', appName: 'Process', orgName: 'Test', brandColour: '#6366f1',
      logoUrl: null, systemPrompt: '', capabilities: [], isConfigured: true,
    })
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ fields: [{ key: 'Vendor', value: 'Acme Ltd' }, { key: 'Amount', value: '£500' }] }),
    }) as any

    render(<App />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Paste a document, email, or form content here...')).toBeInTheDocument()
    })
    fireEvent.change(screen.getByPlaceholderText('Paste a document, email, or form content here...'), { target: { value: 'Invoice content' } })
    fireEvent.click(screen.getByRole('button', { name: 'Extract data' }))

    await waitFor(() => {
      expect(screen.getByText('Acme Ltd')).toBeInTheDocument()
    })
    expect(screen.getByText('£500')).toBeInTheDocument()
  })
})
