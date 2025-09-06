import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Vegetable } from './VegetableInput';

interface TruckVisualizerProps {
  vegetables: Vegetable[];
  truckType?: 'ambient' | 'refrigerated' | 'ventilated';
  truckSize?: 'small' | 'medium' | 'large';
}

interface LoadZone {
  id: string;
  vegetables: Vegetable[];
  temperature: string;
  position: { x: number; y: number; width: number; height: number };
  color: string;
}

function optimizeLoading(vegetables: Vegetable[]): LoadZone[] {
  if (vegetables.length === 0) return [];
  
  // Group vegetables by temperature requirements
  const temperatureGroups = vegetables.reduce((groups, veg) => {
    const tempKey = `${veg.idealTemp.min}-${veg.idealTemp.max}`;
    if (!groups[tempKey]) {
      groups[tempKey] = [];
    }
    groups[tempKey].push(veg);
    return groups;
  }, {} as Record<string, Vegetable[]>);
  
  // Separate high ethylene producers from sensitive vegetables
  const zones: LoadZone[] = [];
  let zoneIndex = 0;
  
  Object.entries(temperatureGroups).forEach(([tempRange, veggies]) => {
    const highEthyleneProducers = veggies.filter(v => v.ethyleneProduction === 'high');
    const ethyleneSensitive = veggies.filter(v => v.ethyleneSensitivity === 'high');
    const others = veggies.filter(v => v.ethyleneProduction !== 'high' && v.ethyleneSensitivity !== 'high');
    
    // Create separate zones if needed
    if (highEthyleneProducers.length > 0 && ethyleneSensitive.length > 0) {
      // Zone for high ethylene producers
      zones.push({
        id: `zone-${zoneIndex++}`,
        vegetables: highEthyleneProducers,
        temperature: `${tempRange}°C`,
        position: { x: 10, y: 10 + zones.length * 120, width: 180, height: 100 },
        color: 'bg-warning-orange/20 border-warning-orange/40'
      });
      
      // Zone for ethylene sensitive
      zones.push({
        id: `zone-${zoneIndex++}`,
        vegetables: ethyleneSensitive,
        temperature: `${tempRange}°C`,
        position: { x: 210, y: 10 + (zones.length) * 120, width: 180, height: 100 },
        color: 'bg-fresh-green-light/40 border-fresh-green/40'
      });
      
      // Zone for others if any
      if (others.length > 0) {
        zones.push({
          id: `zone-${zoneIndex++}`,
          vegetables: others,
          temperature: `${tempRange}°C`,
          position: { x: 410, y: 10 + (zones.length) * 120, width: 180, height: 100 },
          color: 'bg-secondary/60 border-border'
        });
      }
    } else {
      // Single zone for all vegetables in this temperature group
      zones.push({
        id: `zone-${zoneIndex++}`,
        vegetables: veggies,
        temperature: `${tempRange}°C`,
        position: { x: 10 + (zones.length % 3) * 200, y: 10 + Math.floor(zones.length / 3) * 120, width: 180, height: 100 },
        color: 'bg-fresh-green-light/40 border-fresh-green/40'
      });
    }
  });
  
  return zones;
}

export function TruckVisualizer({ vegetables, truckType = 'refrigerated', truckSize = 'medium' }: TruckVisualizerProps) {
  const loadZones = optimizeLoading(vegetables);
  
  if (vegetables.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Truck Layout</h3>
        <div className="text-center text-muted-foreground">
          <p>Add vegetables to see optimal truck loading layout</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Optimal Truck Layout</h3>
      
      <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-dashed border-border rounded-lg p-4 min-h-[300px] overflow-hidden">
        {/* Truck outline */}
        <div className="absolute inset-2 border-2 border-muted-foreground/20 rounded-lg">
          <div className="absolute -top-3 left-4 bg-muted px-2 py-1 rounded text-xs text-muted-foreground font-medium">
            {truckSize.charAt(0).toUpperCase() + truckSize.slice(1)} • {truckType.charAt(0).toUpperCase() + truckType.slice(1)} Truck
          </div>
        </div>
        
        {/* Load zones */}
        {loadZones.map((zone) => (
          <div
            key={zone.id}
            className={`absolute border-2 rounded-lg p-3 ${zone.color} backdrop-blur-sm`}
            style={{
              left: `${zone.position.x}px`,
              top: `${zone.position.y}px`,
              width: `${zone.position.width}px`,
              height: `${zone.position.height}px`,
            }}
          >
            <div className="text-xs font-medium text-foreground mb-2">
              Zone {zone.id.split('-')[1]} • {zone.temperature}
            </div>
            <div className="space-y-1">
              {zone.vegetables.map((veg, index) => (
                <div key={`${veg.id}-${index}`} className="flex items-center justify-between">
                  <span className="text-xs text-foreground truncate">{veg.name}</span>
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    {veg.quantity}
                  </Badge>
                </div>
              ))}
            </div>
            
            {/* Ethylene indicator */}
            {zone.vegetables.some(v => v.ethyleneProduction === 'high') && (
              <div className="absolute top-1 right-1">
                <div className="w-2 h-2 bg-warning-orange rounded-full" title="High ethylene producer" />
              </div>
            )}
            {zone.vegetables.some(v => v.ethyleneSensitivity === 'high') && (
              <div className="absolute top-1 right-4">
                <div className="w-2 h-2 bg-fresh-green rounded-full" title="Ethylene sensitive" />
              </div>
            )}
          </div>
        ))}
        
        {/* Legend */}
        <div className="absolute bottom-2 right-2 bg-card/90 backdrop-blur-sm p-2 rounded border text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-warning-orange rounded-full" />
              <span>High ethylene producer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-fresh-green rounded-full" />
              <span>Ethylene sensitive</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading tips */}
      <div className="mt-4 text-xs text-muted-foreground space-y-1">
        <p>• Zones are separated by temperature and ethylene compatibility</p>
        <p>• High ethylene producers are isolated from sensitive vegetables</p>
        <p>• Maintain recommended temperature ranges for optimal freshness</p>
      </div>
    </Card>
  );
}
