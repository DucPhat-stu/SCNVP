import { useEffect, useState } from 'react';
import { Button, Empty, Skeleton, Space, Flex, Typography, Card } from 'antd';
import { PlusOutlined, ReloadOutlined, LayoutOutlined } from '@ant-design/icons';
import { MainLayout } from '@/layout/MainLayout';
import { ProjectCard } from './ProjectCard';
import { CreateProjectModal } from './CreateProjectModal';
import { useProjects } from './useProjects';

const { Title, Text } = Typography;

/**
 * DashboardPage component.
 * Displays a list of projects and provides functionality to create or delete them.
 */
export function DashboardPage() {
  const {
    projects,
    isLoading,
    isCreating,
    fetchProjects,
    createProject,
    deleteProject,
  } = useProjects();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (values: any) => {
    try {
      await createProject(values);
      setIsModalOpen(false);
    } catch (error) {
      // Error handled in useProjects
    }
  };

  return (
    <MainLayout
      title="Dashboard"
      subtitle="Manage your smart city network projects and topologies."
    >
      <Flex vertical gap={32} className="max-w-[1200px] mx-auto w-full">
        {/* Header Section */}
        <Flex justify="space-between" align="end" wrap="wrap" gap={16}>
          <Flex align="center" gap={12}>
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
              <LayoutOutlined className="text-xl" />
            </div>
            <div>
              <Title level={2} className="!text-2xl !font-bold !text-white !m-0 tracking-tight">Project Workspace</Title>
              <Text className="!text-white/40 !text-sm mt-1">You have {projects.length} active projects</Text>
            </div>
          </Flex>
          
          <Space size="middle">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchProjects()}
              loading={isLoading && projects.length > 0}
              className="scnvp-button--outline border-white/5"
            >
              Sync
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              className="scnvp-button--primary h-10 px-6"
            >
              New Project
            </Button>
          </Space>
        </Flex>

        {/* Content Section */}
        {isLoading && projects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="scnvp-card" styles={{ body: { padding: 24 } }}>
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </Card>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="dashboard-grid w-full !max-w-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={deleteProject}
              />
            ))}
          </div>
        ) : (
          <Flex 
            vertical 
            justify="center" 
            align="center" 
            className="py-32 rounded-2xl border-2 border-dashed border-white/5 bg-white/[0.02] backdrop-blur-sm"
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Flex vertical align="center" gap={8}>
                  <Text className="!text-white/60 !font-medium !text-lg">No projects found</Text>
                  <Text className="!text-white/30 !text-sm max-w-[280px] text-center">
                    Start your smart city journey by creating your first network topology draft.
                  </Text>
                </Flex>
              }
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
                className="scnvp-button--primary h-11 px-8 mt-4"
              >
                Create First Project
              </Button>
            </Empty>
          </Flex>
        )}
      </Flex>

      <CreateProjectModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
        loading={isCreating}
      />
    </MainLayout>
  );
}
