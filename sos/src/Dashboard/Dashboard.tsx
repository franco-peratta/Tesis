import { ReactNode, useEffect, useState } from 'react';
import { Card, Typography } from 'antd';
import {
  AlertOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { getStats } from './Handler';
import { Stats } from './types';
import { AnimatedStatistic } from './AnimatedStatistic';

const { Title } = Typography;

export const Dashboard = () => {
  const [data, setData] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStats();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [setData]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!data) {
    return <div>Error...</div>;
  }

  const {
    totalPatients,
    totalProviders,
    totalAppointments,
    completedAppointments,
    pendingAppointments,
    upcomingAppointments,
    newPatientsLastQuarter,
    completedAppointmentsLastQuarter
  } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <Title level={2} style={{ padding: '0 24px 12px 24px' }}>Dashboard</Title>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
          padding: '0 24px 24px 24px',
        }}
      >
        <StatCard
          title="Número de pacientes"
          value={<AnimatedStatistic
            value={totalPatients}
            precision={0}
            prefix=""
          />}
          icon={<UserOutlined />}
          description="Todos los pacientes registrados"
          color="#f97316"
        />
        <StatCard
          title="Número de doctores"
          value={<AnimatedStatistic
            value={totalProviders}
            precision={0}
            prefix=""
          />}
          icon={<UserOutlined />}
          description="Todos los doctores registrados"
          color="#06b6d4"
        />
        <StatCard
          title="Número de turnos"
          value={<AnimatedStatistic
            value={totalAppointments}
            precision={0}
            prefix=""
          />}
          icon={<CalendarOutlined />}
          description="Todos los turnos creados"
          color="#8b5cf6"
        />
        <StatCard
          title="Número de pacientes nuevos"
          value={<AnimatedStatistic
            value={newPatientsLastQuarter}
            precision={0}
            prefix=""
          />}
          icon={<UserAddOutlined />}
          description="En el último semestre"
          color="#ec4899"
        />
      </div>
      <div style={{ padding: "0 24px 0 24px" }}>
        <Card title="Estado de turnos" bordered={false} style={{}}>
          <p style={{ color: "rgba(0,0,0,0.45)", marginBottom: "1rem" }}>
            Métricas de los turnos
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              padding: "1rem 0",
            }}
          >
            <StatusItem
              icon={<CheckCircleOutlined style={{ color: "#10b981", fontSize: 20 }} />}
              label="Total de turnos completados"
              value={completedAppointments.toLocaleString()}
              color="#10b981"
            />
            <StatusItem
              icon={<CheckCircleOutlined style={{ color: "#10b981", fontSize: 20 }} />}
              label="Turnos completados en el último semestre"
              value={completedAppointmentsLastQuarter.toLocaleString()}
              color="#10b981"
            />
            <StatusItem
              icon={<AlertOutlined style={{ color: "#f59e0b", fontSize: 20 }} />}
              label="Turnos pendientes"
              value={pendingAppointments.toLocaleString()}
              color="#f59e0b"
            />
            <StatusItem
              icon={<ClockCircleOutlined style={{ color: "#3b82f6", fontSize: 20 }} />}
              label="Turnos pendientes"
              value={upcomingAppointments.toLocaleString()}
              color="#3b82f6"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

function StatCard({ title, value, icon, description, color }: { title: string, value: ReactNode | string, icon?: any, description: string, color: string }) {
  const cardStyle = {
    borderRadius: "0.5rem",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    backgroundColor: "white",
    overflow: "hidden",
  }

  const cardContentStyle = {
    padding: "1.5rem",
  }

  const flexContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  }

  const iconContainerStyle = {
    backgroundColor: `${color}20`,
    color: color,
    borderRadius: "0.5rem",
    padding: "0.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }

  const titleStyle = {
    fontSize: "0.875rem",
    color: "#64748b",
    marginBottom: "0.25rem",
  }

  const valueStyle = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#0f172a",
    margin: "0.25rem 0",
  }

  const descriptionStyle = {
    fontSize: "0.75rem",
    color: "#94a3b8",
    margin: 0,
  }

  return (
    <div style={cardStyle}>
      <div style={cardContentStyle}>
        <div style={flexContainerStyle}>
          <div style={iconContainerStyle}>{icon}</div>
          <div>
            <p style={titleStyle}>{title}</p>
            <p style={valueStyle}>{value}</p>
            <p style={descriptionStyle}>{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}


function StatusItem({ icon, label, value, color }: { icon: ReactNode, label: string, value: string, color: string }) {
  const containerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.5rem",
    borderRadius: "0.375rem",
    backgroundColor: `${color}10`,
  }

  const iconStyle = {
    color: color,
  }

  const labelContainerStyle = {
    flex: 1,
  }

  const labelStyle = {
    fontSize: "0.875rem",
    color: "#64748b",
    margin: 0,
  }

  const valueStyle = {
    fontWeight: "bold",
    color: "#0f172a",
    margin: 0,
  }

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>{icon}</div>
      <div style={labelContainerStyle}>
        <p style={labelStyle}>{label}</p>
      </div>
      <div style={valueStyle}>{value}</div>
    </div>
  )
}
