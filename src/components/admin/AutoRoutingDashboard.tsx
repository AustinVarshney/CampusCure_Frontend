import { useIsMobile } from '@/hooks/use-mobile';
import { CheckCircleOutlined, ThunderboltOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Col, message, Row, Spin, Statistic, Table } from 'antd';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface RoutingStats {
  totalAutoAssigned: number;
  assignmentsByCategory: Record<string, number>;
  facultyWorkload: Array<{
    facultyId: string;
    name: string;
    department: string;
    activeComplaints: number;
  }>;
}

interface FacultyWorkload {
  facultyId: string;
  name: string;
  department: string;
  activeComplaints: number;
}

interface CategoryAssignment {
  key: string;
  category: string;
  assignments: number;
}

const AutoRoutingDashboard: React.FC = () => {
  const isMobile = useIsMobile();
  const [stats, setStats] = useState<RoutingStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRoutingStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/routing/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to load routing stats:', error);
      message.error('Failed to load routing statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutingStats();
  }, []);

  if (loading) {
    return (
      <Card>
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <div className="text-center py-8">
          <p>No routing statistics available</p>
          <Button onClick={loadRoutingStats}>Retry</Button>
        </div>
      </Card>
    );
  }

  const categoryData = Object.entries(stats.assignmentsByCategory).map(([category, count]) => ({
    key: category,
    category: category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
    assignments: count
  }));

  const facultyColumns = [
    {
      title: 'Faculty Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Active Complaints',
      dataIndex: 'activeComplaints',
      key: 'activeComplaints',
      sorter: (a: FacultyWorkload, b: FacultyWorkload) => a.activeComplaints - b.activeComplaints,
    },
  ];

  const categoryColumns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Total Assignments',
      dataIndex: 'assignments',
      key: 'assignments',
      sorter: (a: CategoryAssignment, b: CategoryAssignment) => a.assignments - b.assignments,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Auto-Assigned"
              value={stats.totalAutoAssigned}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Faculty"
              value={stats.facultyWorkload.length}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Avg. Workload"
              value={stats.facultyWorkload.length > 0 
                ? (stats.facultyWorkload.reduce((sum, f) => sum + f.activeComplaints, 0) / stats.facultyWorkload.length).toFixed(1)
                : 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Assignment by Category */}
      <Card title="Auto-Assignments by Category" className="shadow-sm">
        {isMobile ? (
          <div className="space-y-2">
            {categoryData.map((item) => (
              <div key={item.key} className="rounded-lg border p-3 flex items-center justify-between">
                <span className="text-sm font-medium">{item.category}</span>
                <span className="text-sm text-muted-foreground">{item.assignments}</span>
              </div>
            ))}
          </div>
        ) : (
          <Table
            dataSource={categoryData}
            columns={categoryColumns}
            pagination={false}
            size="small"
          />
        )}
      </Card>

      {/* Faculty Workload */}
      <Card title="Faculty Workload Distribution" className="shadow-sm">
        {isMobile ? (
          <div className="space-y-2">
            {stats.facultyWorkload.map((faculty) => (
              <div key={faculty.facultyId} className="rounded-lg border p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{faculty.name}</span>
                  <span className="text-sm font-semibold">{faculty.activeComplaints}</span>
                </div>
                <p className="text-xs text-muted-foreground">{faculty.department}</p>
              </div>
            ))}
          </div>
        ) : (
          <Table
            dataSource={stats.facultyWorkload}
            columns={facultyColumns}
            pagination={{ pageSize: 10 }}
            size="small"
            rowKey="facultyId"
          />
        )}
      </Card>

      <div className="text-xs text-muted-foreground bg-muted/40 rounded-xl p-4">
        <p className="font-semibold text-foreground mb-2">Auto-Routing Rules</p>
        <ul className="space-y-1.5">
          <li>• <strong>Projector / Smart Board:</strong> IT & Computer Engineering faculty (Networks, DBMS expertise preferred)</li>
          <li>• <strong>Fan / Light:</strong> Electrical Engineering faculty</li>
          <li>• <strong>Seating:</strong> Civil & Mechanical Engineering faculty</li>
          <li>• Assignment considers current workload and department expertise</li>
        </ul>
      </div>
    </div>
  );
};

export default AutoRoutingDashboard;