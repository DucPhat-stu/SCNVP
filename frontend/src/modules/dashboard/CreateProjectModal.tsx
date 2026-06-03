import { Modal, Form, Input, InputNumber, Select, Space } from 'antd';
import { 
  PlusOutlined, 
  InfoCircleOutlined, 
  EnvironmentOutlined, 
  ProjectOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { ProjectScale } from '@shared/types';

interface CreateProjectModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading: boolean;
}

/**
 * Modal component for creating a new smart city network project.
 * Features a vertical form with validation and formatted inputs.
 */
export function CreateProjectModal({ open, onCancel, onSubmit, loading }: CreateProjectModalProps) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      // Validation error handled by Form.Item
    }
  };

  return (
    <Modal
      title={
        <Space>
          <PlusOutlined className="text-primary-500" />
          <span>Create New Project</span>
        </Space>
      }
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Create Project"
      cancelText="Cancel"
      width={520}
      centered
      className="scnvp-modal"
      okButtonProps={{ className: 'scnvp-button--primary' }}
      cancelButtonProps={{ className: 'scnvp-button--outline' }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ scale: ProjectScale.SMALL }}
        className="mt-6"
        requiredMark="optional"
      >
        <Form.Item
          name="name"
          label={
            <Space size={4}>
              <ProjectOutlined />
              <span>Project Name</span>
            </Space>
          }
          rules={[{ required: true, message: 'Please enter a project name' }]}
        >
          <Input placeholder="e.g. HCM District 1 Backbone" className="h-10" />
        </Form.Item>

        <Form.Item 
          name="description" 
          label={
            <Space size={4}>
              <InfoCircleOutlined />
              <span>Description</span>
            </Space>
          }
        >
          <Input.TextArea 
            placeholder="Describe the purpose of this network architecture..." 
            rows={3} 
            className="resize-none"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item 
            name="cityName" 
            label={
              <Space size={4}>
                <EnvironmentOutlined />
                <span>City</span>
              </Space>
            }
          >
            <Input placeholder="e.g. Ho Chi Minh" className="h-10" />
          </Form.Item>

          <Form.Item 
            name="scale" 
            label={
              <Space size={4}>
                <ProjectOutlined />
                <span>Scale</span>
              </Space>
            } 
            rules={[{ required: true }]}
          >
            <Select className="h-10">
              <Select.Option value={ProjectScale.SMALL}>Small (Single Site)</Select.Option>
              <Select.Option value={ProjectScale.MEDIUM}>Medium (Campus)</Select.Option>
              <Select.Option value={ProjectScale.LARGE}>Large (District)</Select.Option>
              <Select.Option value={ProjectScale.CITY_SCALE}>City Scale (Metropolitan)</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item 
          name="budget" 
          label={
            <Space size={4}>
              <DollarOutlined />
              <span>Budget (USD)</span>
            </Space>
          }
        >
          <InputNumber<number>
            className="w-full h-10 flex items-center"
            formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as unknown as number}
            min={0}
            placeholder="50,000"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
