import React from 'react';
import { Card, Button } from '@nextui-org/react';
import { Briefcase, Globe, Wrench } from 'lucide-react';

export default function AcquisitionTab({ gameState, setGameState }) {
    const buyCompany = (companyId, cost) => {
        if (gameState.money >= cost) {
            setGameState(prev => ({
                ...prev,
                money: prev.money - cost,
                acquisitions: {
                    ...(prev.acquisitions || {}),
                    [companyId]: true
                }
            }));
        } else {
            alert("Not enough funds for this corporate buyout!");
        }
    };

    const has = (id) => gameState.acquisitions?.[id];

    return(
        <Card isBlurred className="flex-1 p-8 bg-background/40 border-none shadow-lg overflow-y-auto">
            <h2 className="text-3xl font-bold mb-2">Mergers & Acquisitions</h2>
            <p className="text-default-500 mb-8">Execute hostile takeovers of rival corporations to gain massive permanent monopolies.</p>

            <div className="flex flex-col gap-6">
                <Card className="p-6 bg-primary/10 border border-primary/30 flex flex-row justify-between items-center">
                    <div>
                        <h3 className="font-bold text-xl mb-2 flex items-center gap-2"><Briefcase className="text-primary"/> BudgetJet Airlines</h3>
                        <p className="text-sm text-default-400 max-w-md">Absorb the biggest budget carrier. Eliminates low-end competition, allowing you to charge more.</p>
                        <p className="text-sm font-bold text-success mt-2">Effect: +30% Global Ticket Revenue permanently</p>
                    </div>
                    <Button
                        color={has('budgetJet') ? "success" : "primary"}
                        variant={has('budgetJet') ? "flat" : "shadow"}
                        size="lg"
                        isDisabled={has('budgetJet')}
                        onPress={() => buyCompany('budgetJet', 50000000)}
                    >
                        {has('budgetJet') ? "ACQUIRED" : "Hostile Takeover ($50M)"}
                    </Button>
                </Card>

                <Card className="p-6 bg-secondary/10 border border-secondary/30 flex flex-row justify-between items-center">
                    <div>
                        <h3 className="font-bold text-xl mb-2 flex items-center gap-2"><Globe className="text-secondary"/> GlobalAir Consortium</h3>
                        <p className="text-sm text-default-400 max-w-md">Buy out the world's largest international travel agency and their airport slots.</p>
                        <p className="text-sm font-bold text-success mt-2">Effect: +50% Global Ticket Revenue permanently.</p>
                    </div>
                    <Button
                        color={has('globalAir') ? "success" : "secondary"}
                        variant={has('globalAir') ? "flat" : "shadow"}
                        size="lg"
                        isDisabled={has('globalAir')}
                        onPress={() => buyCompany('globalAir', 150000000)}
                    >
                        {has('globalAir') ? "ACQUIRED" : "Hostile Takeover ($150M)"}
                    </Button>
                </Card>

                <Card className="p-6 bg-warning/10 border border-warning/30 flex flex-row justify-between items-center">
                    <div>
                        <h3 className="font-bold text-xl mb-2 flex items-center gap-2"><Wrench className="text-warning"/> AeroTech Maintenance Corp</h3>
                        <p className="text-sm text-default-400 max-w-md">Acquire a global aircraft maintenance conglomerate to service your fleet in-house.</p>
                        <p className="text-sm font-bold text-success mt-2">Effect: Plane condition never decays naturally.</p>
                    </div>
                    <Button
                        color={has('aeroTech') ? "success" : "warning"}
                        variant={has('aeroTech') ? "flat" : "shadow"}
                        size="lg"
                        isDisabled={has('aeroTech')}
                        onPress={() => buyCompany('aeroTech', 300000000)}
                    >
                        {has('aeroTech') ? "ACQUIRED" : "Hostile Takeover ($300M)"}
                    </Button>
                </Card>
            </div>
        </Card>
    )
}