# 08 — Testing Strategy & Test Cases
## Smart City Network Visualization Platform (SCNVP)

---

## 1. Testing Pyramid

```
        ┌──────────────────────┐
        │    E2E (Playwright)  │  ← 10% — slow, high confidence
        │    ~20 key flows     │
        ├──────────────────────┤
        │  Integration (Jest   │  ← 30% — API contracts, DB
        │  + Supertest)        │
        ├──────────────────────┤
        │   Unit Tests         │  ← 60% — services, hooks, utils
        │  (Jest + Vitest)     │
        └──────────────────────┘
```

**Coverage Target:** 80% overall, 90% for critical paths (auth, cost, simulation)

---

## 2. Backend Unit Tests (Jest)

### Auth Service Tests

```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  describe('register', () => {
    it('should hash password before saving', async () => {
      const dto = { email: 'test@test.com', password: 'Plain123!', role: 'ENGINEER' };
      const result = await authService.register(dto);
      expect(result.user.passwordHash).not.toBe('Plain123!');
      expect(result.token).toBeDefined();
    });

    it('should throw ConflictException if email exists', async () => {
      await authService.register({ email: 'taken@test.com', ... });
      await expect(authService.register({ email: 'taken@test.com', ... }))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const result = await authService.login({ email, password });
      expect(result.token).toMatch(/^eyJ/);
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      await expect(authService.login({ email, password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should issue new token pair and invalidate old refresh token', async () => {
      const { refreshToken } = await authService.login({ email, password });
      const newTokens = await authService.refreshToken(refreshToken);
      expect(newTokens.token).toBeDefined();
      // Old refresh token should be blacklisted
      await expect(authService.refreshToken(refreshToken))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
```

---

### Network Service Tests

```typescript
// network.service.spec.ts
describe('NetworkService', () => {
  describe('saveTopology', () => {
    it('should persist all nodes and connections', async () => {
      const topology = {
        nodes: [mockNode1, mockNode2],
        connections: [mockConn1],
      };
      const saved = await networkService.saveTopology('proj_123', topology);
      expect(saved.nodes).toHaveLength(2);
      expect(saved.connections).toHaveLength(1);
    });

    it('should update positions of existing nodes without duplicating', async () => {
      const initial = await networkService.saveTopology('proj_123', { nodes: [mockNode1], connections: [] });
      const updated = { ...mockNode1, posX: 999 };
      const result = await networkService.saveTopology('proj_123', { nodes: [updated], connections: [] });
      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].posX).toBe(999);
    });

    it('should enforce node count limit for STUDENT role', async () => {
      const nodes = Array.from({ length: 21 }, (_, i) => ({ ...mockNode1, id: `node_${i}` }));
      await expect(networkService.saveTopology('proj_123', { nodes, connections: [] }, 'STUDENT'))
        .rejects.toThrow(ForbiddenException);
    });
  });
});
```

---

### Cost Service Tests

```typescript
// cost.service.spec.ts
describe('CostService', () => {
  it('should calculate correct CAPEX for ISP_ROUTER node', () => {
    const result = costService.estimateNode({ type: 'ISP_ROUTER' });
    expect(result.capex).toBe(COST_TABLE.ISP_ROUTER.capex); // e.g., 120000
  });

  it('should calculate fiber connection cost based on bandwidth tier', () => {
    const conn = { linkType: 'FIBER', bandwidth: 10000 }; // 10Gbps
    const result = costService.estimateConnection(conn);
    expect(result.capex).toBeGreaterThan(costService.estimateConnection({ linkType: 'FIBER', bandwidth: 1000 }).capex);
  });

  it('should return zero OPEX for nodes with no ongoing cost', () => {
    const result = costService.estimateNode({ type: 'SMART_SENSOR' });
    // Sensors have minimal opex
    expect(result.opex).toBeLessThan(100);
  });

  it('full topology cost should sum all node and connection costs', () => {
    const nodes = [mockISPRouter, mockEdgeRouter];
    const connections = [mockFiberConn];
    const result = costService.estimateTopology({ nodes, connections });
    const expected = costService.estimateNode(mockISPRouter).capex +
                     costService.estimateNode(mockEdgeRouter).capex +
                     costService.estimateConnection(mockFiberConn).capex;
    expect(result.capex.total).toBe(expected);
  });
});
```

---

## 3. Backend Integration Tests (Supertest)

### Auth API Integration

```typescript
// auth.e2e-spec.ts
describe('POST /api/v1/auth/login', () => {
  it('200 with valid credentials', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'TestPass123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toMatch(/^eyJ/);
  });

  it('401 with wrong password', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('400 with missing email', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ password: 'TestPass123!' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

### Network API Integration

```typescript
describe('PUT /api/v1/projects/:id/network', () => {
  it('should save and retrieve topology correctly', async () => {
    const topology = { nodes: [mockNode], connections: [mockConn], metadata: {} };

    await request(app.getHttpServer())
      .put(`/api/v1/projects/${projectId}/network`)
      .set('Authorization', `Bearer ${engineerToken}`)
      .send(topology)
      .expect(200);

    const getRes = await request(app.getHttpServer())
      .get(`/api/v1/projects/${projectId}/network`)
      .set('Authorization', `Bearer ${engineerToken}`)
      .expect(200);

    expect(getRes.body.data.nodes).toHaveLength(1);
    expect(getRes.body.data.nodes[0].type).toBe('EDGE_ROUTER');
  });

  it('403 if accessing another user project', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/projects/${otherUserProjectId}/network`)
      .set('Authorization', `Bearer ${engineerToken}`)
      .expect(403);
  });
});
```

---

## 4. Frontend Unit Tests (Vitest)

### Canvas Hook Tests

```typescript
// useCanvas.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCanvasStore } from '@/store/canvasStore';

describe('useCanvasStore', () => {
  it('should add a node', () => {
    const { result } = renderHook(() => useCanvasStore());
    act(() => {
      result.current.addNode({ type: 'EDGE_ROUTER', posX: 100, posY: 200 });
    });
    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.nodes[0].type).toBe('EDGE_ROUTER');
  });

  it('undo should remove last added node', () => {
    const { result } = renderHook(() => useCanvasStore());
    act(() => { result.current.addNode(mockNode); });
    act(() => { result.current.undo(); });
    expect(result.current.nodes).toHaveLength(0);
  });

  it('redo should re-add the node', () => {
    const { result } = renderHook(() => useCanvasStore());
    act(() => { result.current.addNode(mockNode); });
    act(() => { result.current.undo(); });
    act(() => { result.current.redo(); });
    expect(result.current.nodes).toHaveLength(1);
  });
});
```

### Cost Display Component Tests

```typescript
// CostPanel.test.tsx
import { render, screen } from '@testing-library/react';
import { CostPanel } from '@/modules/cost/CostPanel';

describe('CostPanel', () => {
  it('displays CAPEX total in USD format', () => {
    render(<CostPanel capex={1800000} opex={45000} />);
    expect(screen.getByText('$1,800,000')).toBeInTheDocument();
  });

  it('shows loading skeleton while fetching', () => {
    render(<CostPanel loading={true} />);
    expect(screen.getByTestId('cost-skeleton')).toBeInTheDocument();
  });

  it('shows "add nodes to see estimate" when no nodes', () => {
    render(<CostPanel capex={0} opex={0} nodeCount={0} />);
    expect(screen.getByText(/add nodes/i)).toBeInTheDocument();
  });
});
```

---

## 5. E2E Tests (Playwright)

### Critical Flow 1: Engineer Full Workflow

```typescript
// engineer-workflow.spec.ts
test('Engineer creates project, builds topology, runs simulation', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name=email]', 'engineer@test.com');
  await page.fill('[name=password]', 'TestPass123!');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/dashboard');

  // Create project
  await page.click('[data-testid=new-project-btn]');
  await page.fill('[name=projectName]', 'E2E Test Project');
  await page.selectOption('[name=scale]', 'MEDIUM');
  await page.click('[data-testid=create-project-submit]');
  await expect(page).toHaveURL(/\/project\/.+\/canvas/);

  // Add node via drag (simulate drop)
  const palette = page.locator('[data-testid=device-palette]');
  const canvas = page.locator('[data-testid=canvas-area]');
  await palette.locator('[data-node-type=EDGE_ROUTER]').dragTo(canvas);
  await expect(canvas.locator('[data-node-type=EDGE_ROUTER]')).toBeVisible();

  // Save
  await page.keyboard.press('Control+S');
  await expect(page.locator('[data-testid=save-indicator]')).toContainText('Saved');

  // Run simulation
  await page.click('[data-testid=run-simulation-btn]');
  await expect(page.locator('[data-testid=sim-status]')).toContainText('Running');
  await expect(page.locator('[data-testid=sim-status]')).toContainText('Complete', { timeout: 30000 });
});
```

### Critical Flow 2: AI Chat + Suggestion Applied

```typescript
test('User receives AI suggestion and applies to canvas', async ({ page }) => {
  await loginAs(page, 'engineer@test.com');
  await openProject(page, testProjectId);

  // Open AI panel
  await page.click('[data-testid=ai-panel-toggle]');

  // Send message
  await page.fill('[data-testid=ai-input]', 'Analyze my topology for issues');
  await page.keyboard.press('Enter');

  // Wait for streaming response
  await expect(page.locator('[data-testid=ai-response]')).not.toBeEmpty({ timeout: 10000 });

  // Check for suggestion card
  await expect(page.locator('[data-testid=suggestion-card]')).toBeVisible({ timeout: 5000 });

  // Dismiss suggestion
  await page.click('[data-testid=dismiss-suggestion]');
  await expect(page.locator('[data-testid=suggestion-card]')).not.toBeVisible();
});
```

### Critical Flow 3: Student Role Restrictions

```typescript
test('Student cannot access cost estimator', async ({ page }) => {
  await loginAs(page, 'student@test.com');
  await page.goto('/dashboard');

  // Cost tab should not exist
  await expect(page.locator('[data-testid=cost-tab]')).not.toBeVisible();

  // Canvas node limit enforced
  await openProject(page, studentProjectId);
  for (let i = 0; i < 21; i++) {
    await addNodeToCanvas(page, 'EDGE_ROUTER');
  }
  await expect(page.locator('[data-testid=node-limit-warning]')).toBeVisible();
});
```

---

## 6. Python Simulation Service Tests (pytest)

```python
# test_simulation.py
import pytest
from engines.networkx_engine import NetworkXEngine
from models.topology import TopologyInput, NodeInput, ConnectionInput

@pytest.fixture
def simple_topology():
    return TopologyInput(
        nodes=[
            NodeInput(id="n1", type="ISP_ROUTER"),
            NodeInput(id="n2", type="EDGE_ROUTER"),
            NodeInput(id="n3", type="OFFICE"),
        ],
        connections=[
            ConnectionInput(source="n1", target="n2", bandwidth=1000),
            ConnectionInput(source="n2", target="n3", bandwidth=100),
        ]
    )

def test_builds_graph_correctly(simple_topology):
    engine = NetworkXEngine()
    graph = engine.build_graph(simple_topology)
    assert graph.number_of_nodes() == 3
    assert graph.number_of_edges() == 2

def test_detects_spof(simple_topology):
    engine = NetworkXEngine()
    spof_nodes = engine.find_spof(simple_topology)
    # n2 is SPOF because removing it disconnects n3 from n1
    assert "n2" in spof_nodes

def test_shortest_path(simple_topology):
    engine = NetworkXEngine()
    path = engine.shortest_path(simple_topology, "n1", "n3")
    assert path == ["n1", "n2", "n3"]

def test_disconnected_graph_raises():
    topology = TopologyInput(
        nodes=[NodeInput(id="n1"), NodeInput(id="n2")],
        connections=[]  # no connections
    )
    engine = NetworkXEngine()
    with pytest.raises(ValueError, match="disconnected"):
        engine.find_spof(topology)
```

---

## 7. Test Data Factories

```typescript
// tests/factories.ts
export const createMockUser = (overrides = {}) => ({
  id: 'user_test_001',
  email: 'test@example.com',
  role: 'ENGINEER',
  ...overrides,
});

export const createMockProject = (overrides = {}) => ({
  id: 'proj_test_001',
  name: 'Test Project',
  scale: 'MEDIUM',
  budget: 100000,
  status: 'ACTIVE',
  ...overrides,
});

export const createMockNode = (overrides = {}) => ({
  id: `node_${Date.now()}`,
  type: 'EDGE_ROUTER',
  label: 'Test Router',
  posX: 100,
  posY: 200,
  status: 'ACTIVE',
  ...overrides,
});

export const createMockTopology = (nodeCount = 3) => ({
  nodes: Array.from({ length: nodeCount }, (_, i) =>
    createMockNode({ id: `node_${i}`, label: `Node ${i}` })
  ),
  connections: nodeCount > 1 ? [
    createMockConnection({ sourceId: 'node_0', targetId: 'node_1' })
  ] : [],
});
```

---

## 8. CI Test Pipeline

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_DB: scnvp_test, POSTGRES_PASSWORD: test }
        ports: ['5432:5432']
      redis:
        image: redis:7
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx prisma migrate deploy
        env: { DATABASE_URL: postgresql://postgres:test@localhost:5432/scnvp_test }
      - run: npm run test:unit -- --coverage
      - run: npm run test:integration

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run test -- --coverage --reporter=verbose

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]
    steps:
      - uses: actions/checkout@v4
      - run: docker-compose up -d
      - run: npx playwright install chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  python-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install -r simulation/requirements.txt
      - run: pytest simulation/ --cov=simulation --cov-report=xml
```