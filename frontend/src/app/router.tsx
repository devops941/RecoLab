import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';

import { OverviewPage } from '../modules/dashboard/OverviewPage';
import { DatasetWorkspacePage } from '../modules/datasets/DatasetWorkspacePage';
import { ProductCataloguePage } from '../modules/products/ProductCataloguePage';
import { InteractionsPage } from '../modules/interactions/InteractionsPage';
import { ValidationPage } from '../modules/validation/ValidationPage';
import { AlgorithmConfigPage } from '../modules/config/AlgorithmConfigPage';

import { ContentBasedPage } from '../modules/recommendations/ContentBasedPage';
import { ItemItemPage } from '../modules/recommendations/ItemItemPage';
import { HybridPage } from '../modules/recommendations/HybridPage';
import { RecommendationExplorerPage } from '../modules/recommendations/RecommendationExplorerPage';

import { BenchmarkingPage } from '../modules/benchmarking/BenchmarkingPage';
import { BehaviourAnalysisPage } from '../modules/analytics/BehaviourAnalysisPage';
import { PriceAnalysisPage } from '../modules/analytics/PriceAnalysisPage';
import { DemandAnalysisPage } from '../modules/analytics/DemandAnalysisPage';
import { InsightsPage } from '../modules/analytics/InsightsPage';

import { ExperimentHistoryPage } from '../modules/experiments/ExperimentHistoryPage';
import { ReportsPage } from '../modules/reports/ReportsPage';
import { SettingsPage } from '../modules/settings/SettingsPage';

import { LoginPage } from '../modules/auth/LoginPage';
import { RegisterPage } from '../modules/auth/RegisterPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'datasets', element: <DatasetWorkspacePage /> },
      { path: 'products', element: <ProductCataloguePage /> },
      { path: 'interactions', element: <InteractionsPage /> },
      { path: 'validation', element: <ValidationPage /> },

      { path: 'metrics', element: <AlgorithmConfigPage /> },
      { path: 'algorithm-config', element: <AlgorithmConfigPage /> },

      { path: 'recommendations/content-based', element: <ContentBasedPage /> },
      { path: 'recommendations/item-item', element: <ItemItemPage /> },
      { path: 'recommendations/hybrid', element: <HybridPage /> },
      { path: 'recommendations/explorer', element: <RecommendationExplorerPage /> },

      { path: 'benchmarking', element: <BenchmarkingPage /> },
      { path: 'analytics/behaviour', element: <BehaviourAnalysisPage /> },
      { path: 'analytics/price', element: <PriceAnalysisPage /> },
      { path: 'analytics/demand', element: <DemandAnalysisPage /> },
      { path: 'insights', element: <InsightsPage /> },

      { path: 'experiments', element: <ExperimentHistoryPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);
