import React from 'react';
import styled from 'styled-components';

interface CardProps {
  title: string;
  body: string;
  showButton?: boolean;
  color?: string; // base color (like brand color)
}

const Card: React.FC<CardProps> = ({
  title,
  body,
  showButton = false,
  color = '#0d6efd', // Bootstrap primary as brand color
}) => {
  return (
    <StyledWrapper color={color}>
      <div className="card">
        <div className="card-details">
          <p className="text-title">{title}</p>
          <p className="text-body">{body}</p>
        </div>
        {showButton && <button className="card-button">More info</button>}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ color: string }>`
  .card {
  width: 100%;
  min-width: 300px;
  min-height: 220px;
  border-radius: 2rem;
  background: ${(props) => props.color};
  color: #fff;
  padding: 2rem;
  position: relative;
  text-align: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
}
  .card-details {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .text-title {
    font-size: 2rem;
    font-weight: 500;
    opacity: 0.9;
  }

  .text-body {
    font-size: 4rem;
    font-weight: 700;
    line-height: 1.2;
  }

  .card-button {
    position: absolute;
    bottom: -2rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    border: none;
    border-radius: 1rem;
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
    backdrop-filter: blur(4px);
    cursor: pointer;
    opacity: 0;
    transition: all 0.3s ease;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  }

  .card:hover .card-button {
    opacity: 1;
    bottom: -1.5rem;
  }

  @media (max-width: 768px) {
    .text-body {
      font-size: 2rem;
    }
  }
`;

export default Card;
