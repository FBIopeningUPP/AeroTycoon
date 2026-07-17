import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Divider, Progress } from '@nextui-org/react';
import { Plane, Map, Settings, Play, Pause, FastForward, BarChart3, BadgeAlert } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, matchByIndex } from 'recharts';
import Globe from 'react-globe.gl';
import { hsla } from 'framer-motion';
import ServicesTab from './ServicesTab';
import AcquisitionTab from './AcquisitionsTab';
import { Coffee, Briefcase } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState(() => {
    const savedData = localStorage.getItem('aerotycoonsave');
    if (savedData) {
      return JSON.parse(savedData);
    }

    return {
      money: 15000000,
      debt: 0,
      marketingActive: 0,
      sharesIssued: 0,
      sharePrice: 100,
      research: {
        aerodynamics: false,
        fuelEfficiency: false,
        luxuryCabins: false
      },
      mechanics: 0,
      competitors: [],
      reputation: 85,
      ticketPrice: 1.0,
      day: 1,
      isPaused: true,
      gameSpeed: 1000,
      ownedPlanes: [],
      history: [],
      activeEvent: null,
      eventDaysLeft: 0,
      destinations: [
        { id: 'd1', name: 'New York (Hub)', cost: 0, isUnlocked: true, baseRevenue: 2000, lat: 40.71, lng: -74.00 },
        { id: 'd2', name: 'London', cost: 3000000, isUnlocked: false, baseRevenue: 8000, lat: 51.50, lng: -0.12 },
        { id: 'd3', name: 'Paris', cost: 5000000, isUnlocked: false, baseRevenue: 10000, lat: 48.85, lng: 2.35 },
        { id: 'd4', name: 'Tokyo', cost: 8000000, isUnlocked: false, baseRevenue: 15000, lat: 35.67, lng: 139.65 },
        { id: 'd5', name: 'Dubai', cost: 12000000, isUnlocked: false, baseRevenue: 22000, lat: 25.20, lng: 55.27 },
        { id: 'd6', name: 'Rio de Janeiro', cost: 15000000, isUnlocked: false, baseRevenue: 25000, lat: -22.90, lng: -43.17 },
        { id: 'd7', name: 'Singapore', cost: 18000000, isUnlocked: false, baseRevenue: 28000, lat: 1.35, lng: 103.81 },
        { id: 'd8', name: 'Sydney', cost: 25000000, isUnlocked: false, baseRevenue: 35000, lat: -33.86, lng: 151.20 }
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

              // LOCALIZED WEATHER SYSTEM
              const updatedDestinations = prevState.destinations.map(dest => {
                if (!dest.isUnlocked) return dest;
                let newWeather = dest.weather || 'Clear';
                if (Math.random() < 0.05) { // 5% chance weather changes daily
                  const options = ['Clear', 'Clear', 'Clear', 'Storm', 'Snow'];
                  newWeather = options[Math.floor(Math.random() * options.length)];
                }
                return { ...dest, weather: newWeather };
              });

              let newReputation = prevState.reputation;
              let newMarketing = Math.max(0, (prevState.marketingActive || 0) - 1);
              let newCompetitors = [...(prevState.competitors || [])];

              // 2% chance per day a rival airline invades an unlocked route
              if (Math.random() < 0.02) {
                const unlockedRoutes = updatedDestinations.filter(d => d.isUnlocked && d.id !== 'd1');
                if (unlockedRoutes.length > 0) {
                  const target = unlockedRoutes[Math.floor(Math.random() * unlockedRoutes.length)];
                  if (!newCompetitors.find(c => c.routeId === target.id)) {
                     newCompetitors.push({ routeId: target.id, health: 100 });
                  }
                }
              }

              if (newMarketing > 0) {
                newReputation = 100;
              } else {
                if (prevState.ticketPrice > 1.2) {
                  newReputation -= (prevState.ticketPrice - 1.0) * 0.5;
                } else if (prevState.ticketPrice < 1.0) {
                  newReputation += (1.0 - prevState.ticketPrice);
                } else if (newReputation < 85) {
                  newReputation += 0.2;
                }
              }
              newReputation = Math.max(0, Math.min(100, newReputation));

              let dailyProfit = 0;
              let maintenanceFines = 0;
              const conditionDecay = prevState.acquisitions?.aeroTech ? 0 : Math.max(0.2, 1.0 - ((prevState.mechanics || 0) * 0.1));

              const updatedPlanes = prevState.ownedPlanes.map(plane => {
                if (!plane.assignedRoute) return plane;

                let currentCondition = plane.condition;
                const isAce = plane.pilot === 'Ace';

                const route = updatedDestinations.find(d => d.id === plane.assignedRoute);

                // Weather & Pilot Damage Mechanics
                if (!isAce && Math.random() < 0.05) currentCondition -= 10; // Rookie mistake
                if (route?.weather === 'Storm') currentCondition -= 5; // Hail damage

                const newCondition = currentCondition - conditionDecay;
                if (newCondition <= 0) {
                  maintenanceFines += 10000000;
                  return { ...plane, condition: 0, assignedRoute: null};
                }

                let revenue = route ? route.baseRevenue : 0;
                if (newEvent && newEvent.type === "revenue") revenue *= newEvent.multiplier;

                // Weather Revenue Penalties
                if (route?.weather === 'Storm') revenue *= 0.2; // 80% drop in ticket sales
                if (route?.weather === 'Snow') revenue *= 0.5;  // 50% drop in ticket sales

                if (prevState.research?.aerodynamics) revenue *= 1.2;
                if (prevState.research?.luxuryCabins) revenue *= 1.3;

                // Services Revenue Modifiers
                if (prevState.services?.wifi) revenue *= 1.1;
                if (prevState.services?.drinks) revenue *= 1.25;
                if (prevState.services?.food && newReputation < 95) newReputation += 0.5; // Food boosts rep!

                if (prevState.acquisitions?.budgetJet) revenue *= 1.3;
                if (prevState.acquisitions?.globalAir) revenue *= 1.5;

                const rivalIndex = newCompetitors.findIndex(c => c.routeId === plane.assignedRoute);
                if (rivalIndex !== -1) {
                   revenue *= 0.6;
                   if (prevState.ticketPrice <= 0.8) {
                      newCompetitors[rivalIndex].health -= 5;
                   }
                }

                revenue = revenue * prevState.ticketPrice * (newReputation / 100);
                if (isAce) revenue *= 1.2;

                dailyProfit += revenue;
                return { ...plane, condition: newCondition };
              });

              newCompetitors = newCompetitors.filter(c => c.health > 0);

              let newSharePrice = prevState.sharePrice || 100;
              if (newReputation > 90) newSharePrice *= 1.02;
              else if (newReputation < 50) newSharePrice *= 0.95;
              newSharePrice = Math.max(10, newSharePrice);

              let dailyInterest = (prevState.debt || 0) * 0.02;
              let mechanicSalaries = (prevState.mechanics || 0) * 1000;
              let dividendCost = (prevState.sharesIssued || 0) * newSharePrice * 0.05;

              let serviceCosts = 0;
              if (prevState.services?.wifi) serviceCosts += (prevState.ownedPlanes.length * 500);
              if (prevState.services?.food) serviceCosts += (prevState.ownedPlanes.length * 1000);
              if (prevState.services?.drinks) serviceCosts += (prevState.ownedPlanes.length * 2500);

              let operatingCosts = (prevState.ownedPlanes.length * 500) + dailyInterest + mechanicSalaries + dividendCost + serviceCosts;
              if (newEvent && newEvent.type === "cost") operatingCosts *= newEvent.multiplier;
              if (prevState.research?.fuelEfficiency) operatingCosts *= 0.7;

              return {
                ...prevState,
                day: prevState.day + 1,
                reputation: newReputation,
                marketingActive: newMarketing,
                competitors: newCompetitors,
                destinations: updatedDestinations,
                ownedPlanes: updatedPlanes,
                sharePrice: newSharePrice,
                money: Math.max(0, prevState.money + dailyProfit - operatingCosts - maintenanceFines),
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

  const { globeCities, globeRoutes} = useMemo(() => {
    const hub = gameState.destinations[0];
    const cities = [{name: hub.name, lat: hub.lat, lng: hub.lng, size:1, color: '#00f0ff'}];
    const routes = [];

    for (let i = 1; i < gameState.destinations.length; i++) {
      const dest = gameState.destinations[i];
      if (dest.isUnlocked) {
        cities.push({name: dest.name, lat: dest.lat, lng: dest.lng, size: 0.6, color: '#b026ff' });
        routes.push({ startLat: hub.lat, startLng: hub.lng, endLat: dest.lat, endLng: dest.lng});
      }
    }
    return {globeCities: cities, globeRoutes: routes};
  }, [gameState.destinations]);

  const buyPlane = (plane) => {
    if (gameState.money >= plane.price) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - plane.price,
        ownedPlanes: [...prev.ownedPlanes, { ...plane, instanceId: Date.now(), condition: 100 }]
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

  const repairPlane = (instanceId) => {
    const repairCost = 250000;
    if(gameState.money >= repairCost) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - repairCost,
        ownedPlanes: prev.ownedPlanes.map( p =>
          p.instanceId === instanceId ? { ...p, condition: 100 } : p
        )
      }))
    } else {
      alert("Not enough funds for maintenance!");
    }
  };

  const takeLoan = () => {
    setGameState(prev => ({
      ...prev,
      money: prev.money + 10000000,
      debt: (prev.debt || 0) + 10000000
    }));
  };

  const repayLoan = () => {
    if (gameState.money >= 10000000 && gameState.debt > 0) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - 10000000,
        debt: prev.debt - 10000000
      }));
    } else {
      alert("You need $10M to repay this loan block!");
    }
  };

  const buyMarketing = () => {
    const cost = 5000000;
    if (gameState.money >= cost) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - cost,
        marketingActive: 14
      }));
    } else {
      alert("Not enough funds for Marketing Campaign ($5M)!");
    }
  };

  const hireMechanic = () => {
    if (gameState.money >= 50000) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - 50000,
        mechanics: (prev.mechanics || 0) + 1
      }));
    } else {
      alert("Not enough funds to hire a Mechanic ($50k)!");
    }
  };

  const buyResearch = (tech, cost) => {
    if(gameState.money >= cost && !gameState.research?.[tech]) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - cost,
        research: { ...(prev.research || {}), [tech]: true }
      }));
    } else {
      alert("Not enough funds or already researched!");
    }
  };

  const trainPilot = (instanceId) => {
    const cost = 1000000;
    if (gameState.money >= cost) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - cost,
        ownedPlanes: prev.ownedPlanes.map(p =>
          p.instanceId === instanceId ? {...p, pilot: 'Ace'} : p
        )
      }));
    } else {
      alert("Not enough funds to train an Ace Pilot ($1M)!");
    }
  };

  const issueShares = () => {
    if ((gameState.sharesIssued || 0) >= 1000) {
      alert("The SEC won't allow you to issue more than 1000 shares!");
      return;
    }
    setGameState(prev => ({
      ...prev,
      sharesIssued: (prev.sharesIssued || 0) + 100,
      money: prev.money + (100 * (prev.sharePrice || 100))
    }));
  };

  const buybackShares = () => {
    if ((gameState.sharesIssued || 0) >= 100) {
      const cost = 100 * (gameState.sharePrice || 100);
      if (gameState.money >= cost) {
        setGameState(prev => ({
          ...prev,
          sharesIssued: prev.sharesIssued - 100,
          money: prev.money - cost
        }));
      } else {
        alert("Not enough funds for stock buyback!");
      }
    }
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
          <NavButton
            icon={<Coffee size={18} />}
            label="Services"
            isActive={activeTab === 'services'}
            onPress={() => setActiveTab('services')}
          />
          <NavButton
            icon={<Briefcase size={18} />}
            label="Acquisitions"
            isActive={activeTab === 'acquisitions'}
            onPress={() => setActiveTab('acquisitions')}
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
            <div className="absolute top-4 left-4 z-20 pointer-events-none">
              <h2 className="text-2xl font-bold text-primary drop-shadow-md">Global Command</h2>
              <p className="text-default-400">Drag to rotate • Scroll to zoom</p>
            </div>

            <div className="absolute bottom-6 left-6 z-20 flex gap-4 pointer-events-none">
              <Card className="p-4 bg-background/80 backdrop-blur-md border border-default-200/50 w-64 shadow-lg pointer-events-auto">
                <h3 className="font-bold text-lg mb-2">Marketing Dept</h3>
                <p className="text-xs text-default-400 mb-4">Super Bowl Ad: Max Reputation for 14 Days.</p>
                {gameState.marketingActive > 0 ? (
                  <Button color="success" variant="flat" fullWidth isDisabled>Active ({gameState.marketingActive} days)</Button>
                ) : (
                  <Button color="primary" variant="shadow" fullWidth onPress={buyMarketing}>Run Ad ($5M)</Button>
                )}
              </Card>

              <Card className="p-4 bg-background/80 backdrop-blur-md border border-default-200/50 w-64 shadow-lg pointer-events-auto">
                <h3 className="font-bold text-lg mb-2 flex justify-between">HR Dept <span className="text-primary">{gameState.mechanics || 0} Hired</span></h3>
                <p className="text-xs text-default-400 mb-4">Mechanics slow plane damage. $1k/day salary.</p>
                <Button color="warning" variant="shadow" fullWidth onPress={hireMechanic}>Hire Mechanic ($50k)</Button>
              </Card>
            </div>

            <div className="w-full h-full cursor-move flex items-center justify-center pt-8 z-10 absolute inset-0">
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
                arcStroke={0.4}
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
                  <Card key={plane.instanceId} className="p-4 bg-primary/10 border border-primary/30 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{plane.name}</h3>
                        <p className="text-xs text-default-400">
                          Status: {plane.condition <= 0 ? <span className="text-danger font-bold">GROUNDED</span> : (plane.assignedRoute ? 'Flying' : 'Idle')}
                        </p>
                        <p className="text-xs mt-1">
                          Pilot: {plane.pilot === 'Ace' ? <span className="text-success font-bold">★ Ace Pilot</span> : <span className="text-warning">Rookie (Risk of Damage)</span>}
                        </p>
                      </div>
                      <Plane size={24} className={plane.condition <= 20 ? "text-danger animate-pulse" : "text-primary opacity-50"} />
                    </div>

                    <div className="flex items-center gap-4">
                      <Progress
                        size="sm"
                        color={plane.condition > 50 ? "success" : plane.condition > 20 ? "warning" : "danger"}
                        value={plane.condition || 0}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        color="warning"
                        variant="flat"
                        onPress={() => repairPlane(plane.instanceId)}
                        isDisabled={plane.condition === 100}
                      >
                        Repair (250k)
                      </Button>  
                      {plane.pilot !== 'Ace' && (
                        <Button
                          size="sm"
                          color="secondary"
                          variant="shadow"
                          onPress={() => trainPilot(plane.instanceId)}
                        >
                          Train Ace ($1M)
                        </Button>
                      )}                      
                    </div>
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
                const rival = (gameState.competitors || []).find(c => c.routeId === dest.id);

                return (
                  <Card key={dest.id} className="p-4 bg-default-100/10 border border-default-200/20 flex flex-row justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {dest.name}
                        {dest.weather === 'Storm' && <span className="text-xl" title="Storm">⛈️</span>}
                        {dest.weather === 'Snow' && <span className="text-xl" title="Snow">❄️</span>}
                        {dest.weather === 'Clear' && <span className="text-xl" title="Clear Skies">☀️</span>}
                        
                        {dest.isUnlocked ? (
                          <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">Unlocked</span>
                        ) : (
                          <span className="text-xs bg-danger/20 text-danger px-2 py-1 rounded">Locked</span>
                        )}
                        {rival && (
                          <span className="text-xs bg-danger text-white px-2 py-1 rounded font-bold animate-pulse">⚔️ CONTESTED!</span>
                        )}
                      </h3>
                      <p className="text-sm text-default-500">
                        {dest.isUnlocked
                          ? `Generating: $${dest.baseRevenue}/day per plane | Active Planes: ${activePlanes}`
                          : `Unlock Cost: $${(dest.cost / 1000000).toFixed(1)}M`}
                      </p>
                      
                      {dest.weather === 'Storm' && <span className="block text-xs text-danger font-bold mt-1">Severe Storm: -80% Revenue & High Plane Damage!</span>}
                      {dest.weather === 'Snow' && <span className="block text-xs text-warning font-bold mt-1">Snow: -50% Revenue</span>}
                      
                      {rival && (
                         <p className="text-xs text-danger font-bold mt-1">
                           Rival stealing 40% revenue! Drop Ticket Price to 0.8x to fight!
                         </p>
                      )}
                    </div>

                    <div className="flex items-center gap-6">
                      {rival && (
                        <div className="flex flex-col gap-1 w-32 text-right">
                          <p className="text-xs font-bold text-danger">RIVAL HP: {rival.health}</p>
                          <Progress size="sm" color="danger" value={rival.health} />
                        </div>
                      )}

                      {dest.isUnlocked ? (
                        <Button color="primary" variant="flat" onPress={() => assignPlaneToRoute(dest.id)}>
                          Assign Idle Plane
                        </Button>
                      ) : (
                        <Button color="warning" variant="flat" onPress={() => unlockRoute(dest.id, dest.cost)}>
                          Unlock Route
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        )}

        {activeTab === 'finances' && (
          <Card isBlurred className="flex-1 p-8 bg-background/40 border-none shadow-lg flex flex-col">
            <div className="flex justify-between items-start mb-6 gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">Financial Overview</h2>
                    <p className="text-sm text-default-500 mb-8">30-Day Balance History</p>
                  </div>

                  <div className="flex gap-4">
                    <Card className="p-4 bg-default-100/10 border border-default-200/20 w-64 shadow-inner">
                      <p className="text-sm font-bold mb-3 flex justify-between">
                        Ticket Pricing
                        <span className="text-primary">{gameState.ticketPrice?.toFixed(1) || 1.0}x</span>
                      </p>
                      <input
                        type="range"
                        min="0.5" max="3.0" step="0.1"
                        value={gameState.ticketPrice || 1.0}
                        onChange={(e) => setGameState(prev => ({...prev, ticketPrice: parseFloat(e.target.value)}))}
                        className="w-full accent-primary mb-2 cursor-pointer"
                      />
                      <p className="text-xs text-default-500">
                        {gameState.ticketPrice > 1.2 ? "⚠️ Draining Reputation!" : "✓ Prices are fair."}
                      </p>
                    </Card>

                    <Card className="p-4 bg-default-100/10 border border-default-200/20 w-64 shadow-inner flex flex-col justify-between">
                      <div>
                        <p className="text-sm font-bold flex justify-between">
                          Corporate Debt
                          <span className="text-danger">${(gameState.debt || 0).toLocaleString()}</span>
                        </p>
                        <p className="text-xs text-default-500 mt-1">2% daily interest rate.</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" color="success" variant="flat" className="flex-1" onPress={takeLoan}>Loan $10M</Button>
                        <Button size="sm" color="danger" variant="flat" className="flex-1" onPress={repayLoan} isDisabled={!gameState.debt}>Repay $10M</Button>
                      </div>
                    </Card>
                  </div>

                  <Card className="p-4 bg-default-100/10 border border-default-200/20 w-72 shadow-inner flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-bold flex justify-between">
                        Stock Market (IPO)
                        <span className="text-primary">${gameState.sharePrice?.toFixed(2) || 100} / share</span>
                      </p>
                      <p className="text-xs text-default-500 mt-1">Shares Issued: {gameState.sharesIssued || 0}</p>
                      <p className="text-xs text-danger mt-1">5% Daily Dividend Cost: ${(((gameState.sharesIssued || 0) * (gameState.sharePrice || 100)) * 0.05).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" color="primary" variant="flat" className="flex-1" onPress={issueShares}>Issue 100</Button>
                      <Button size="sm" color="warning" variant="flat" className="flex-1" onPress={buybackShares} isDisabled={!gameState.sharesIssued}>Buyback 100</Button>
                    </div>
                  </Card>
                </div>

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
          <Card isBlurred className="flex-1 p-8 bg-background/40 border-none shadow-lg overflow-y-auto">
            <h2 className="text-3xl font-bold mb-2">Research & Development</h2>
            <p className="text-default-500 mb-8">Invest in permanent corporate upgrades</p>

            <div className="grid grid-cols-3 gap-6 w-full mb-12">
              <Card className="p-4 bg-primary/10 border border-primary/20">
                <h3 className="font-bold text-lg mb-1">Aerodynamics</h3>
                <p className="text-xs text-default-400 mb-4">Planes fly faster. +20% Daily Revenue.</p>
                {gameState.research?.aerodynamics ? (
                  <Button color="success" variant="flat" fullWidth isDisabled>Researched</Button>
                ) : (
                  <Button color="primary" variant="shadow" fullWidth onPress={() => buyResearch('aerodynamics', 25000000)}>Research ($25M)</Button>
                )}
              </Card>

              <Card className="p-4 bg-primary/10 border border-primary/20">
                <h3 className="font-bold text-lg mb-1">Fuel Efficiency</h3>
                <p className="text-xs text-default-400 mb-4">New engines. -30% Total Operating Costs.</p>
                {gameState.research?.fuelEfficiency ? (
                  <Button color="success" variant="flat" fullWidth isDisabled>Researched</Button>
                ) : (
                  <Button color="primary" variant="shadow" fullWidth onPress={() => buyResearch('fuelEfficiency', 40000000)}>Research ($40M)</Button>
                )}
              </Card>

              <Card className="p-4 bg-primary/10 border border-primary/20">
                <h3 className="font-bold text-lg mb-1">Luxury Cabins</h3>
                <p className="text-xs text-default-400 mb-4">Premium seating. +30% Base Ticket Revenue.</p>
                {gameState.research?.luxuryCabins ? (
                  <Button color="success" variant="flat" fullWidth isDisabled>Researched</Button>
                ) : (
                  <Button color="primary" variant="shadow" fullWidth onPress={() => buyResearch('luxuryCabins', 60000000)}>Research ($60M)</Button>
                )}
              </Card>
            </div>

            <Divider className="my-8" />

            <h2 className="text-2xl font-bold mb-2">System Controls</h2>
            <p className="text-default-500 mb-6">Manage your save data and game settings.</p>

            <div className="flex gap-4 w-full max-w-2xl">
              <Button size="lg" color="primary" variant="shadow" onPress={saveGame} className="flex-1">
                Save Game to Browser
              </Button>
              <Button size="lg" color="primary" variant="shadow" onPress={loadGame} className="flex-1">
                Load Save Game
              </Button>
              <Button size="lg" color="primary" variant="shadow" onPress={resetGame} className="flex-1">
                Hard Reset
              </Button>
            </div>
          </Card>
        )}
        {activeTab === 'services' && (
          <ServicesTab gameState={gameState} setGameState={setGameState} />
        )}
        {activeTab === 'acquisitions' && (
          <AcquisitionTab gameState={gameState} setGameState={setGameState} />
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