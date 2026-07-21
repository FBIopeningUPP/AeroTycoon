import { Card, Button } from '@nextui-org/react';
import { Wifi, Utensils, Wine } from 'lucide-react';

export default function ServicesTab({gameState, setGameState }) {
    const toggleService = (serviceName) => {
        const isEnabled = gameState.services?.[serviceName];

        setGameState(prev => ({
            ...prev,
            services: {
                ...(prev.services || {}),
                [serviceName]: !isEnabled
            }
        }));
    };

    const getServiceStatus = (serviceName) => gameState.services?.[serviceName] || false;

    return (
        <Card isBlurred className="flex-1 p-8 bg-background/40 border-none shadow-lg overflow-y-auto">
            <h2 className="text-3xl font-bold mb-2">In-Flight Services</h2>
            <p className="text-default-500 mb-8">Offer premium services to increase base ticket revenue and keep reputation high.</p>

            <div className="grid grid-cols-3 gap-6 w-full">
                <Card className="p-4 bg-primary/10 border border-primary/20 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2"><Wifi size={18}/>High-Speed Wi-Fi</h3>
                        <p className="text-xs text-default-400 mb-4">Cost: $500/day per active plane.</p>
                        <p className="text-sm font-semibold text-success mb-6">Effect: +10% Ticket Revenue</p>
                    </div>
                    <Button
                        color={getServiceStatus('wifi') ? "danger" : "primary"}
                        variant={getServiceStatus('wifi') ? "flat" : "shadow"}
                        fullWidth
                        onPress={() => toggleService('wifi', 500)}
                    >
                        {getServiceStatus('wifi') ? "Disable Wi-Fi" : "Enable Wi-Fi"}
                    </Button>
                </Card>

                <Card className="p-4 bg-primary/10 border border-primary/20 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2"><Utensils size={18}/>Hot Meals</h3>
                        <p className="text-xs font-default-400 mb-4">Cost: $1,100/day per active plane.</p>
                        <p className="text-sm font-semibold text-success mb-6">Effect: Reputation slowly increases over time.</p>
                    </div>
                    <Button
                        color={getServiceStatus('food') ? "danger" : "primary"}
                        variant={getServiceStatus('food') ? "flat" : "shadow"}
                        fullWidth
                        onPress={() => toggleService('food', 1000)}
                    >
                        {getServiceStatus('food') ? "disbale meals" : "enable meals"}
                    </Button>
                </Card>

                <Card className="p-4 bg-primary/10 border border-primary/20 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2"><Wine size={18}/>Open Bar</h3>
                        <p className="text-xs font-default-400 mb-4">Cost: $2,500/Day per active plane.</p>
                        <p className="text-sm font-semibold text-success mb-6">Effect: +25% Ticket Revenue</p>
                    </div>
                    <Button
                        color={getServiceStatus('drinks') ? "danger" : "primary"}
                        variant={getServiceStatus('drinks') ? "flat" : "shadow"}
                        fullWidth
                        onPress={() => toggleService('drinks', 2500)}
                    >
                        {getServiceStatus('drinks') ? "Disable Open Bar" : "Enable Open Bar"}
                    </Button>
                </Card>
            </div>
        </Card>
    );
}