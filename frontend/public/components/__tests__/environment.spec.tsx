import { screen, waitFor } from '@testing-library/react';

import { t } from '../../../__mocks__/i18next';
import { UnconnectedEnvironmentPage } from '../environment';
import * as rbacModule from '@console/dynamic-plugin-sdk/src/app/components/utils/rbac';
import { DeploymentModel } from '../../models';
import * as k8sResourceModule from '@console/dynamic-plugin-sdk/src/utils/k8s/k8s-resource';
import { renderWithProviders } from '@console/shared/src/test-utils/unit-test-utils';

describe('EnvironmentPage', () => {
  const obj = { metadata: { namespace: 'test' } };
  const sampleEnvData = [
    { env: [{ name: 'DATABASE_URL', value: 'postgresql://localhost:5432', ID: 0 }] },
  ];

  describe('Read-only Environment View', () => {
    it('verifies the environment variables in a read-only format for users without edit permissions', async () => {
      renderWithProviders(
        <UnconnectedEnvironmentPage
          obj={obj}
          model={DeploymentModel}
          rawEnvData={sampleEnvData}
          envPath={[]}
          readOnly={true}
          t={t}
        />,
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('DATABASE_URL')).toBeVisible();
      });
      expect(screen.getByDisplayValue('postgresql://localhost:5432')).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Reload' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Help' })).not.toBeInTheDocument();
    });

    it('does not show field level help in read-only mode', async () => {
      renderWithProviders(
        <UnconnectedEnvironmentPage
          obj={obj}
          model={DeploymentModel}
          rawEnvData={[{ env: [{ name: 'test', value: ':0', ID: 0 }] }]}
          envPath={[]}
          readOnly={true}
          t={t}
        />,
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('test')).toBeVisible();
      });

      expect(screen.queryByRole('button', { name: 'Help' })).not.toBeInTheDocument();
      expect(screen.queryByText(/Set environment variables/)).not.toBeInTheDocument();
    });

    it('verifies environment variables clearly without editing capabilities', async () => {
      renderWithProviders(
        <UnconnectedEnvironmentPage
          obj={obj}
          model={DeploymentModel}
          rawEnvData={sampleEnvData}
          envPath={[]}
          readOnly={true}
          t={t}
        />,
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('DATABASE_URL')).toBeVisible();
      });

      expect(screen.getByDisplayValue('DATABASE_URL')).toBeDisabled();
      expect(screen.getByDisplayValue('postgresql://localhost:5432')).toBeDisabled();
    });
  });

  describe('Environment Access Control', () => {
    beforeEach(() => {
      jest.spyOn(rbacModule, 'checkAccess').mockResolvedValue({ status: { allowed: false } });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('restricts editing capabilities when user lacks update permissions', async () => {
      renderWithProviders(
        <UnconnectedEnvironmentPage
          obj={obj}
          model={DeploymentModel}
          rawEnvData={sampleEnvData}
          envPath={[]}
          readOnly={false}
          t={t}
        />,
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('DATABASE_URL')).toBeVisible();
      });
      expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
    });

    it('does not display save and reload buttons without permission', () => {
      renderWithProviders(
        <UnconnectedEnvironmentPage
          obj={obj}
          model={DeploymentModel}
          rawEnvData={[{ env: [{ name: 'test', value: ':0', ID: 0 }] }]}
          envPath={[]}
          readOnly={false}
          t={t}
        />,
      );

      expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Reload' })).not.toBeInTheDocument();
    });

    it('does not show field level help when user lacks permissions', async () => {
      renderWithProviders(
        <UnconnectedEnvironmentPage
          obj={obj}
          model={DeploymentModel}
          rawEnvData={[{ env: [{ name: 'test', value: ':0', ID: 0 }] }]}
          envPath={[]}
          readOnly={false}
          t={t}
        />,
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('test')).toBeVisible();
      });

      expect(screen.queryByRole('button', { name: 'Help' })).not.toBeInTheDocument();
      expect(screen.queryByText(/Set environment variables/)).not.toBeInTheDocument();
    });
  });

  describe('When in edit mode with permissions', () => {
    beforeEach(() => {
      jest.spyOn(k8sResourceModule, 'k8sGet').mockResolvedValue({});
      jest.spyOn(rbacModule, 'checkAccess').mockResolvedValue({ status: { allowed: true } });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('verifies field level help when user has permissions', async () => {
      renderWithProviders(
        <UnconnectedEnvironmentPage
          obj={obj}
          model={DeploymentModel}
          rawEnvData={[{ env: [{ name: 'test', value: ':0', ID: 0 }] }]}
          envPath={[]}
          readOnly={false}
          t={t}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('Single values (env)')).toBeVisible();
      });

      expect(screen.getByRole('button', { name: 'Help' })).toBeVisible();
    });

    it('verifies save and reload buttons when user has permissions', async () => {
      renderWithProviders(
        <UnconnectedEnvironmentPage
          obj={obj}
          model={DeploymentModel}
          rawEnvData={[{ env: [{ name: 'test', value: ':0', ID: 0 }] }]}
          envPath={[]}
          readOnly={false}
          t={t}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText('Single values (env)')).toBeVisible();
      });
      expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Reload' })).toBeVisible();
    });
  });

  describe('Environment Form Interface', () => {
    it('verifies environment variables form interface', () => {
      renderWithProviders(
        <UnconnectedEnvironmentPage
          obj={obj}
          model={DeploymentModel}
          rawEnvData={[{ env: [{ name: 'test', value: ':0', ID: 0 }] }]}
          envPath={[]}
          readOnly={true}
          t={t}
        />,
      );

      expect(screen.getByText('Single values (env)')).toBeVisible();
      expect(screen.getByLabelText('Contents')).toBeVisible();
    });
  });
});
