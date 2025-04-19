import React from 'react';
import { IconType } from 'react-icons';

interface DashboardCardProps {
  title: string;
  icon: IconType;
  description: string;
  onClick: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, icon: Icon, description, onClick }) => {
  return (
    <div className="box has-text-centered is-flex is-flex-direction-column is-justify-content-space-between">
      <div>
        <span className="icon is-large has-text-primary">
          <Icon size="3em" />
        </span>
        <h2 className="title is-4 mt-4">{title}</h2>
        <p className="mb-4">{description}</p>
      </div>
      <button className="button is-primary" onClick={onClick}>
        Gestionar
      </button>
    </div>
  );
};

export default DashboardCard;
