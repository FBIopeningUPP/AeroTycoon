import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Divider } from '@nextui-org/react';
import { Plane, Map, Settings, Play, Pause, FastForward, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Globe from 'react-globe.gl';

function App() {
  const [gameState, setGameState] = useState(() => {
    const savedData = localStorage.getItem('aerotycoonsave');
    if (savedData) {
      return JSON.parse(savedData);
    }

    return {
      money: 15000000, 
      reputation: 85,
      day: 1,
      isPaused: true,
      gameSpeed: 1000,
      ownedPlanes: [],
      history: [],
      activeEvent: null,
      eventDaysLeft: 0,
      destinations: [
        { id: 'd1', name: 'New York (Hub)', cost: 0, isUnlocked: true, baseRevenue: 2000 },
        { id: 'd2', name: 'London', cost: 3000000, isUnlocked: false, baseRevenue: 8000 },
        { id: 'd3', name: 'Tokyo', cost: 8000000, isUnlocked: false, baseRevenue: 15000 }
      ]
    };
  });

  const possibleEvents = [
    { title: "📈 Global Tourism Boom! All route revenues increased by 50%.", type: "revenue", multiplier: 1.5, duration: 10 },
    { title: "🛢️ Oil Crisis! Fuel prices spike, doubling operating costs.", type: "cost", multiplier: 2.0, duration: 8 },
    { title: "🏆 Airline Award! Excellent service grants temporary bonus income.", type: "revenue", multiplier: 1.2, duration: 5 }
  ];

  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    let timer;
    if (!gameState.isPaused) {
      timer = setInterval(() => {
        setGameState(prevState => {
          let newEvent = prevState.activeEvent;
          let newEventDays = prevState.eventDaysLeft;

          if (newEvent && newEventDays > 0) {
            newEventDays -= 1;
            if (newEventDays <= 0) newEvent = null;
          }
          else if (!newEvent && Math.random() < 0.03 ) {
            newEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
            newEventDays = newEvent.duration;
          }

          const dailyProfit = prevState.ownedPlanes.reduce((total, plane) => {
            if (plane.assignedRoute) {
              const route = prevState.destinations.find(d => d.id === plane.assignedRoute);
              let revenue = route ? route.baseRevenue : 0;
              if (newEvent && newEvent.type === "revenue") revenue *= newEvent.multiplier;
              return total + revenue;
            }
            return total;
          },0);

          let operatingCosts = prevState.ownedPlanes.length * 500;
          if(newEvent && newEvent.type === "cost") operatingCosts *= newEvent.multiplier;

          return {
            ...prevState,
            day: prevState.day + 1,
            money: Math.max(0, prevState.money + dailyProfit - operatingCosts),
            activeEvent: newEvent,
            eventDaysLeft: newEventDays,
            history: [...prevState.history, {
              day: `Day ${prevState.day}`,
              balance: prevState.money
            }].slice(-80)
          };
        });
      }, gameState.gameSpeed);
    }
    return () => clearInterval(timer);
  }, [gameState.isPaused, gameState.gameSpeed]);

  const togglePause = () => setGameState(prev => ({ ...prev, isPaused: true, gameSpeed: 1000 }));
  const playNormal = () => setGameState(prev => ({ ...prev, isPaused: false, gameSpeed: 1000 }));
  const playFast = () => setGameState(prev => ({ ...prev, isPaused: false, gameSpeed: 200 }));

  const availablePlanes = [
    { id: 'p1', name: 'Cessna Caravan', price: 2500000, capacity: 14, speed: 340 },
    { id: 'p2', name: 'Boeing 737 Max', price: 90000000, capacity: 200, speed: 840 }
  ];

  const { globeCities, globeRoutes } = useMemo(() => {
    const NY = { lat: 40.71, lng: -74.00 };
    const LON = { lat: 51.50, lng: -0.12 };
    const TOK = { lat: 35.67, lng: 139.65 };

    const cities = [
      { name: 'New York', ...NY, size: 1.5, color: '#00f0ff' },
      { name: 'London', ...LON, size: 1, color: gameState.destinations[1].isUnlocked ? '#b026ff' : '#555' },
      { name: 'Tokyo', ...TOK, size: 1, color: gameState.destinations[2].isUnlocked ? '#b026ff' : '#555' }
    ];

    const routes = [];
    if (gameState.destinations[1].isUnlocked) {
      routes.push({ startLat: NY.lat, startLng: NY.lng, endLat: LON.lat, endLng: LON.lng });
    }
    if (gameState.destinations[2].isUnlocked) {
      routes.push({ startLat: NY.lat, startLng: NY.lng, endLat: TOK.lat, endLng: TOK.lng });
    }

    return { globeCities: cities, globeRoutes: routes };
  }, [gameState.destinations]);

  const buyPlane = (plane) => {
    if (gameState.money >= plane.price) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - plane.price,
        ownedPlanes: [...prev.ownedPlanes, { ...plane, instanceId: Date.now() }]
      }));
    } else {
      alert("Not enough funds");
    }
  };

  const unlockRoute = (routeId, cost) => {
    if (gameState.money >= cost) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - cost,
        destinations: prev.destinations.map(d => d.id === routeId ? { ...d, isUnlocked: true } : d)
      }));
    } else {
      alert("Not enough funds to unlock this route!");
    }
  };

  const assignPlaneToRoute = (routeId) => {
    setGameState(prev => {
      const idlePlaneIndex = prev.ownedPlanes.findIndex(p => !p.assignedRoute);

      if (idlePlaneIndex === -1) {
        alert("No idle plane available. Go to Fleet to buy more.");
        return prev;
      }

      const newPlanes = [...prev.ownedPlanes];
      newPlanes[idlePlaneIndex] = { ...newPlanes[idlePlaneIndex], assignedRoute: routeId };

      return { ...prev, ownedPlanes: newPlanes };
    });
  };

  const saveGame = () => {
    localStorage.setItem('aeroTycoonSave', JSON.stringify(gameState));
    alert("Game Saved Successfully!");
  };

  const loadGame = () => {
    const savedData = localStorage.getItem('aeroTycoonSave');
    if (savedData) {
      setGameState(JSON.parse(savedData));
      alert("Game Loaded!");
    } else {
      alert("No saved game found!")
    }
  };

  const resetGame = () => {
    if (window.confirm("Are you sure? this will wipe your entire empire!")) {
      localStorage.removeItem('aeroTycoonSave');
      window.location.reload();
    }
  };

  return (
    <div className="flex h-screen w-full p-4 gap-4">
      <Card isBlurred className="w-64 flex flex-col p-4 bg-background/40 border-none shadow-lg">
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
            icon={<Map size={18} />}
            label="Airports"
            isActive={activeTab === 'airports'}
            onPress={() => setActiveTab('airports')}
          />
          <NavButton 
            icon={<BarChart3 size={18} />}
            label="Finances"
            isActive={activeTab === 'finances'}
            onPress={() => setActiveTab('finances')}
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
        <Card isBlurred className="h-20 flex flex-row items-center justify-between px-8 bg-background/40 border-none shadow-lg">
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

        {activeTab === 'dashboard' && (
          <Card isBlurred className="flex-1 overflow-hidden bg-background/40 border-none shadow-lg relative">
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <h2 className="text-2xl font-bold text-primary drop-shadow-md">Global Command</h2>
              <p className="text-default-400">Drag to rotate • Scroll to zoom</p>
            </div>

            <div className="w-full h-full cursor-move flex items-center justify-center pt-8">
              <Globe
                width={800}
                height={600}
                backgroundColor="rgba(0,0,0,0)"
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                showAtmosphere={true}
                atmosphereColor="#3a228a" 
                atmosphereAltitude={0.15}
                labelsData={globeCities}
                labelLat={d => d.lat}
                labelLng={d => d.lng}
                labelText={d => d.name}
                labelSize={d => d.size}
                labelDotRadius={d => d.size}
                labelColor={d => d.color}
                labelResolution={2}
                arcsData={globeRoutes}
                arcColor={() => ['#ff00ff', '#00ffff']}
                arcAltitudeAutoScale={0.3}
                arcStroke={1.5}
              />
            </div>
          </Card>
        )}
        {gameState.activeEvent && (
              <div className="w-full bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-center gap-3 shadow-lg">
                <BadgeAlert className="text-warning animate-pulse" size={24} />
                <p className="text-sm font-medium text-warning flex-1">
                  <span className="font-bold">BREAKING NEWS:</span> {gameState.activeEvent.title}
                </p>
                <span className="text-xs font-bold bg-warning/20 text-warning px-3 py-1 rounded">
                  {gameState.eventDaysLeft} Days Left
                </span>
              </div>
            )}

        {activeTab === 'fleet' && (
          <Card isBlurred className="flex-1 p-8 bg-background/40 border-none shadow-lg overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-primary">Your Fleet ({gameState.ownedPlanes.length})</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {gameState.ownedPlanes.length === 0 ? (
                <p className="text-default-500">No planes owned yet.</p>
              ) : (
                gameState.ownedPlanes.map(plane => (
                  <Card key={plane.instanceId} className="p-4 bg-primary/10 border border-primary/30 flex justify-between items-center flex-row">
                    <div>
                      <h3 className="font-semibold">{plane.name}</h3>
                      <p className="text-xs text-default-400">Status: {plane.assignedRoute ? 'Flying' : 'Idle'}</p>
                    </div>
                    <Plane size={24} className="text-primary opacity-50" />
                  </Card>
                ))
              )}
            </div>
            
            <Divider className="my-6" />

            <h2 className="text-xl font-bold mb-4">Aircraft Market</h2>
            <div className="grid grid-cols-2 gap-4">
              {availablePlanes.map(plane => (
                <Card key={plane.id} className="p-4 bg-default-100/10 flex justify-between items-center flex-row">
                  <div>
                    <h3 className="font-semibold text-lg">{plane.name}</h3>
                    <p className="text-sm text-default-500">Cap: {plane.capacity} pax | Spd: {plane.speed} km/h</p>
                  </div>
                  <Button
                    color={gameState.money >= plane.price ? "success" : "default"}
                    variant="flat"
                    onPress={() => buyPlane(plane)}
                  >
                    ${(plane.price / 1000000).toFixed(1)}M
                  </Button>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'airports' && (
          <Card isBlurred className="flex-1 p-8 bg-background/40 border-none shadow-lg overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Global Routes</h2>

            <div className="flex flex-col gap-4">
              {gameState.destinations.map(dest => {
                const activePlanes = gameState.ownedPlanes.filter(p => p.assignedRoute === dest.id).length;

                return (
                  <Card key={dest.id} className="p-4 bg-default-100/10 border border-default-200/20 flex flex-row justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {dest.name}
                        {dest.isUnlocked ? (
                          <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">Unlocked</span>
                        ) : (
                          <span className="text-xs bg-danger/20 text-danger px-2 py-1 rounded">Locked</span>
                        )}
                      </h3>
                      <p className="text-sm text-default-500">
                        {dest.isUnlocked
                          ? `Generating: $${dest.baseRevenue}/day per plane | Active Planes: ${activePlanes}`
                          : `Unlock Cost: $${(dest.cost / 1000000).toFixed(1)}M`}
                      </p>
                    </div>

                    {dest.isUnlocked ? (
                      <Button color="primary" variant="flat" onPress={() => assignPlaneToRoute(dest.id)}>
                        Assign Idle Plane
                      </Button>
                    ) : (
                      <Button color="warning" variant="flat" onPress={() => unlockRoute(dest.id, dest.cost)}>
                        Unlock Route
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          </Card>
        )}

        {activeTab === 'finances' && (
          <Card isBlurred className="flex-1 p-8 bg-background/40 border-none shadow-lg flex flex-col">
            <h2 className="text-2xl font-bold mb-2">Financial Overview</h2>
            <p className="text-sm text-default-500 mb-8">30-Day Balance History</p>

            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gameState.history}>
                  <XAxis dataKey="day" stroke="#8b95a5" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#8b95a5"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(13, 17, 33, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#00f0ff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#00f0ff"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 8, fill: '#b026ff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
        {activeTab === 'settings' && (
          <Card isBlurred className="flex-1 p-8 bg-background/40 border-none shadow-lg flex flex-col justify-center items-center">
            <h2 className="text-3xl font-bold mb-2">System Controls</h2>
            <p className="text-default-500 mb-12">Manage your save data and game settings.</p>

            <div className="flex flex-col gap-6 w-full max-w-md">
              <Button size="lg" color="primary" variant="shadow" onPress={saveGame}>
                Save Game To Browser
              </Button>
              <Button size="lg" color="success" variant="flat" onPress={loadGame}>
                Load Save Game
              </Button>
              <Divider className="my-4" />
              <Button size="lg" color="danger" variant="ghost" onPress={resetGame}>
                Hard Reset
              </Button>
            </div>
          </Card>
        )}
        {gameState.money < 0 && (
          <div className="fixed inset-0 z-50 bg-danger/90 backdrop-blur-md flex flex-col items-center justify-center text-white">
            <h1 className="text-6xl font-bold mb-4">BANKRUPT</h1>
            <p className="text-xl mb-8">Yu ran out of mooonaaaay</p>
            <Button size="lg" color="default" variant="shadow" onPress={resetGame}>Try Again bruh</Button>
          </div>
        )}
        {gameState.money >= 100000000 && (
          <div className="fixed inset-0 z-50 bg-success/90 backdrop-blur-md flex flex-col items-center justify-center text-white">
            <h1 className="text-6xl font-bold mb-4">Billionare jeffbezos is taht u</h1>
            <p className="text-xl mb-8">CONGOS TO U</p>
            <Button size="lg" color="default" variant="shadow" onPress={resetGame}>Play again</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function NavButton({ icon, label, isActive, onPress }) {
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

export default App;