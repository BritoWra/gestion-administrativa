import React from 'react';
import { IconType } from 'react-icons'; // For typing the icon prop

interface PagoCardProps {
  title: string;
  icon: IconType;
  description: string;
  onCreditoClick: () => void; // Handler for Credito button
  onDebitoClick: () => void;  // Handler for Debito button
}

const PagoCard: React.FC<PagoCardProps> = ({ title, icon: Icon, description, onCreditoClick, onDebitoClick }) => {
  return (
    <div className="box has-text-centered" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <span className="icon is-large has-text-primary">
          <Icon size="3em" />
        </span>
        <h2 className="title is-4 mt-4">{title}</h2>
        <p className="mb-4">{description}</p>
      </div>
      <div className="buttons is-centered">
        <button className="button is-success" onClick={onCreditoClick}>
          Crédito
        </button>
        <button className="button is-warning" onClick={onDebitoClick}>
          Débito
        </button>
      </div>
    </div>
  );
};

export default PagoCard;
