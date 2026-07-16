import React, { useState, useEffect } from 'react';
import { Card, Button, Divider } from '@nextui-org/react';
import { Plane, Map, Building2, BarChart3, Settings, Play, Pause, FastForward } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState({
    money: 1500000,
    reputation: 85,
    day: 1,
    isPaused: true,
    gameSpeed: 1000
  });

  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    let timer;
    if (!gameState.isPaused) {
      timer = setInterval(() => {
        setGameState(prevState => {
          const dailyProfit = 5000;

          return {
            ...prevState,
            day: prevState.day + 1,
            money: prevState.money + dailyProfit
          };
        });
      }, gameState.gameSpeed);
    }
    return () => clearInterval(timer);
  }, [gameState.isPaused, gameState.gameSpeed]);

  const togglePause = () => setGameState(prev => ({...prev, isPaused: true, gameSpeed: 1000}));
  const playNormal = () => setGameState(prev => ({...prev, isPaused: false, gameSpeed: 1000}));
  const playFast = () => setGameState(prev => ({...prev, isPaused: false, gameSpeed: 200}));

  return (
    <div className="flex h-screen w-full p-4 gap-4">
      <Card
        isBlurred
        className="w-64 flex flex-col p-4 bg-background/40 border-none shadow-lg"
      >
        <div className="flex items-center gap-3 mb-8 px-2 mt-2">
          <Plane className="text-primary" size={28} />
          <div>
            <h1 className="text-xl font-bold tracking-wide">AeroTycoon</h1>
            <p className="text-xs text-default-500">Management Console</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <NavButton 
            icon={<Map size={18} />}
            label="Dashboard"
            isActive={activeTab === 'dashboard'}
            onPress={() => setActiveTab('dashboard')}
          />
          <NavButton 
            icon={<Plane size={18} />}
            label="Fleet"
            isActive={activeTab === 'fleet'}
            onPress={() => setActiveTab('fleet')}
          />
          <NavButton 
            icon={<Plane size={18} />}
            label="Airports"
            isActive={activeTab === 'Airports'}
            onPress={() => setActiveTab('Airports')}
          />
          <NavButton 
            icon={<Plane size={18} />}
            label="Finances"
            isActive={activeTab === 'Finances'}
            onPress={() => setActiveTab('Finances')}
          />
        </div>

        <Divider className="my-6 bg-default-100" />

        <div className="mt-auto">
          <NavButton 
            icon={<Settings size={18} />}
            label="Settings"
            isActive={activeTab === 'settings'}
            onPress={() => setActiveTab('settings')}
          />
        </div>
        </Card>
        <div className="flex flex-col flex-1 gap-4">
          <Card
            isBlurred
            className="h-20 flex flex-row items-center justify-between px-8 bg-background/40 border-none shadow-lg"
          >
            <div className="flex gap-12">
              <div>
                <p className="text-xs text-default-500 uppercase font-semibold">Available Funds</p>
                <h2 className="text-xl font-bold text-success-500">
                  ${gameState.money.toLocaleString()}
                </h2>
              </div>
              <div>
                <p className="text-xs text-default-500 uppercase font-semibold">Reputation</p>
                <h2 className="text-xl font-bold text-primary-500">
                  {gameState.reputation}%
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm font-semibold">Day {gameState.day}</p>
                <p className="text-xs text-default-500">
                  {gameState.isPaused ? 'PAUSED' : gameState.gameSpeed === 1000 ? 'NORMAL SPEED' : 'FAST FORWARD'}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-default-100/20 p-1 rounded-lg">
                <Button
                  isIconOnly
                  variant={gameState.isPaused ? "flat" : "light"}
                  color={gameState.isPaused ? "warning" : "default"}
                  size="sm" radius="md" onPress={togglePause}
                >
                  <Pause size={16} />
                </Button>
                <Button
                  isIconOnly
                  variant={!gameState.isPaused && gameState.gameSpeed === 1000 ? "flat" : "light"}
                  color={!gameState.isPaused && gameState.gameSpeed === 1000 ? "primary" : "default"}
                  size="sm" radius="md" onPress={playNormal}
                >
                  <Play size={16} />
                </Button>
                <Button
                  isIconOnly
                  variant={!gameState.isPaused && gameState.gameSpeed === 1000 ? "flat" : "light"}
                  color={!gameState.isPaused && gameState.gameSpeed === 1000 ? "primary" : "default"}
                  size="sm" radius="md" onPress={playFast}
                >
                  <FastForward size={16} />
                </Button>
              </div>
            </div>
          </Card>

          <Card
            isBlurred
            className="flex-1 flex flex-col items-center justify-cetner bg-background/40 border-none shadow-lg"
          >
            <Map size={48} className="text-default-300 mb-4 opacity-50" />
            <h2 className="text-lg text-default-500 font-medium">Map View goes here</h2>
            <p className="text-sm text-default-400 mt-2 max-w-sm text-center">
              this will have route plan and aiport
            </p>
          </Card>
        </div>
    </div>
  );
}
function NavButton({icon, label, isActive, onPress}) {
  return (
    <Button
      variant={isActive ? "flat" : "light"}
      color={isActive ? "primary" : "default"}
      className={`justify-start px-4 py-6 ${isActive ? "font-semibold" : "font-normal"}`}
      fullWidth
      onPress={onPress}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </Button>
  );
}
export default App