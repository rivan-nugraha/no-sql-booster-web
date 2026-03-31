import { Hourglass } from 'react-loader-spinner';
import './style.css';
import { useRouterState } from '@tanstack/react-router';

const LoadingPage = () => {
  const isLoading = useRouterState({ select: (s) => s.status === 'pending' })

  if (!isLoading) return null

  return (
    <div className="loading-base z-[90] flex justify-center items-center">
        <div className="loading-background"></div>
        <Hourglass
          height="40"
          width="40"
          colors={["#ffffff", "#ffffff"]}
        />
    </div>
  )
}

export default LoadingPage;