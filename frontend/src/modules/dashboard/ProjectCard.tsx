import { Link } from 'react-router-dom';
import { Card, Button, Popconfirm, Tag, Tooltip, Flex, Space, Typography } from 'antd';
import { 
  DeleteOutlined, 
  ArrowRightOutlined, 
  EnvironmentOutlined, 
  DollarOutlined,
  CalendarOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import type { Project } from '@shared/types';
import { ProjectScale } from '@shared/types';

const { Title, Text, Paragraph } = Typography;

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

const scaleColors: Record<ProjectScale, string> = {
  [ProjectScale.SMALL]: 'blue',
  [ProjectScale.MEDIUM]: 'cyan',
  [ProjectScale.LARGE]: 'purple',
  [ProjectScale.CITY_SCALE]: 'gold',
};

/**
 * ProjectCard component for displaying project summary on the dashboard.
 * Uses Ant Design Card with custom SCNVP styles.
 */
export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <Card
      className="scnvp-card hover:border-white/20 transition-all duration-300 h-full"
      styles={{ body: { padding: 0 } }}
      actions={[
        <Popconfirm
          title="Delete project"
          description="Are you sure you want to delete this project? This action cannot be undone."
          onConfirm={() => onDelete(project.id)}
          okText="Yes, delete"
          cancelText="No"
          key="delete"
        >
          <Tooltip title="Delete project">
            <Button type="text" danger icon={<DeleteOutlined />} className="w-full h-full flex items-center justify-center">
              Delete
            </Button>
          </Tooltip>
        </Popconfirm>,
        <Link to={`/project/${project.id}/canvas`} key="open" className="block w-full h-full">
          <Button 
            type="primary" 
            icon={<ArrowRightOutlined />} 
            iconPosition="end"
            className="w-full h-full scnvp-button--primary border-none rounded-none"
          >
            Open Canvas
          </Button>
        </Link>,
      ]}
    >
      <Flex vertical className="p-5 h-full min-h-[220px]">
        <Flex justify="space-between" align="start" gap={8} className="mb-3">
          <Flex vertical className="min-w-0">
            <Title level={5} className="!m-0 truncate !text-white !font-bold" title={project.name}>
              {project.name}
            </Title>
            <Space size={6} className="mt-1 opacity-40 uppercase text-[10px] font-semibold tracking-wider">
              <CalendarOutlined />
              <Text className="!text-inherit">{new Date(project.createdAt).toLocaleDateString()}</Text>
            </Space>
          </Flex>
          <Tag 
            color={scaleColors[project.scale]} 
            className="m-0 border-none bg-opacity-10 backdrop-blur-sm"
          >
            {project.scale.replace('_', ' ')}
          </Tag>
        </Flex>

        <Paragraph 
          ellipsis={{ rows: 2 }} 
          className="!text-white/60 !text-sm mb-5 min-h-[40px]"
        >
          {project.description || 'A smart city network topology designed for efficient communication and throughput.'}
        </Paragraph>

        <Flex gap={16} wrap="wrap" className="mt-auto">
          {project.cityName && (
            <Space size={6} className="text-white/40 text-xs">
              <EnvironmentOutlined className="text-primary-400" />
              <span>{project.cityName}</span>
            </Space>
          )}
          {project.budget !== undefined && (
            <Space size={6} className="text-white/40 text-xs">
              <DollarOutlined className="text-green-400" />
              <span>${project.budget.toLocaleString()}</span>
            </Space>
          )}
          <Space size={6} className="text-white/40 text-xs">
            <ProjectOutlined className="text-purple-400" />
            <span>{project.nodeCount ?? 0} Nodes</span>
          </Space>
        </Flex>
      </Flex>
    </Card>
  );
}
