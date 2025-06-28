import React, { useState } from 'react';
import styled from 'styled-components';
import { fetchChallengeData } from '../utils/geoguessrApi';

const FormContainer = styled.div`
  margin-bottom: 30px;
`;

const FormTitle = styled.h2`
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 600;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  min-width: 300px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const Button = styled.button`
  padding: 15px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  border: 1px solid #fcc;
  color: #c66;
  padding: 15px;
  border-radius: 10px;
  margin-top: 15px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function ChallengeForm({ onAddChallenge, loading, setLoading, error, setError }) {
  const [challengeUrl, setChallengeUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!challengeUrl.trim()) return;

    setLoading(true);
    setError('');

    try {
      const challengeData = await fetchChallengeData(challengeUrl);
      onAddChallenge(challengeData);
      setChallengeUrl('');
    } catch (err) {
      setError(err.message || 'Failed to fetch challenge data. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <FormTitle>Add Challenge</FormTitle>
      <form onSubmit={handleSubmit}>
        <InputGroup>
          <Input
            type="text"
            value={challengeUrl}
            onChange={(e) => setChallengeUrl(e.target.value)}
            placeholder="Enter Geoguessr challenge URL (e.g., https://www.geoguessr.com/challenge/...)"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !challengeUrl.trim()}>
            {loading && <LoadingSpinner />}
            {loading ? 'Fetching...' : 'Add Challenge'}
          </Button>
        </InputGroup>
      </form>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FormContainer>
  );
}

export default ChallengeForm; 