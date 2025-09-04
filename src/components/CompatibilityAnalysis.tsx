import { CheckCircle, AlertTriangle, XCircle, Thermometer, Clock, Truck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Vegetable } from './VegetableInput';

interface CompatibilityResult {
  pair: string;
  compatible: boolean;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

interface TransportRecommendation {
  type: 'refrigerated' | 'ventilated' | 'controlled_atmosphere';
  temperature: { min: number; max: number };
  humidity: string;
  ventilation: boolean;
  separation: string[];
}

interface CompatibilityAnalysisProps {
  vegetables: Vegetable[];
}

// Compatibility logic based on ethylene production/sensitivity and temperature requirements
function analyzeCompatibility(vegetables: Vegetable[]): CompatibilityResult[] {
  const results: CompatibilityResult[] = [];
  
  for (let i = 0; i < vegetables.length; i++) {
    for (let j = i + 1; j < vegetables.length; j++) {
      const veg1 = vegetables[i];
      const veg2 = vegetables[j];
      
      // Check ethylene compatibility
      const ethyleneConflict = (
        (veg1.ethyleneProduction === 'high' && veg2.ethyleneSensitivity === 'high') ||
        (veg2.ethyleneProduction === 'high' && veg1.ethyleneSensitivity === 'high')
      );
      
      // Check temperature compatibility (must overlap)
      const tempConflict = (
        veg1.idealTemp.max < veg2.idealTemp.min || 
        veg2.idealTemp.max < veg1.idealTemp.min
      );
      
      let compatible = true;
      let reason = 'Compatible for transport';
      let severity: 'low' | 'medium' | 'high' = 'low';
      
      if (ethyleneConflict && tempConflict) {
        compatible = false;
        reason = 'Ethylene conflict + temperature mismatch';
        severity = 'high';
      } else if (ethyleneConflict) {
        compatible = false;
        reason = 'Ethylene gas will cause premature ripening';
        severity = 'high';
      } else if (tempConflict) {
        compatible = false;
        reason = 'Incompatible temperature requirements';
        severity = 'medium';
      }
      
      results.push({
        pair: `${veg1.name} + ${veg2.name}`,
        compatible,
        reason,
        severity
      });
    }
  }
  
  return results;
}

// Generate transport recommendations based on vegetable requirements
function getTransportRecommendation(vegetables: Vegetable[]): TransportRecommendation {
  if (vegetables.length === 0) {
    return {
      type: 'ventilated',
      temperature: { min: 10, max: 15 },
      humidity: '85-90%',
      ventilation: true,
      separation: []
    };
  }
  
  // Find temperature range that works for all vegetables
  const minTemp = Math.max(...vegetables.map(v => v.idealTemp.min));
  const maxTemp = Math.min(...vegetables.map(v => v.idealTemp.max));
  
  // Check for high ethylene producers that need separation
  const highEthyleneProducers = vegetables.filter(v => v.ethyleneProduction === 'high');
  const highEthyleneSensitive = vegetables.filter(v => v.ethyleneSensitivity === 'high');
  
  const needsSeparation = highEthyleneProducers.length > 0 && highEthyleneSensitive.length > 0;
  
  return {
    type: minTemp <= 4 ? 'refrigerated' : 'controlled_atmosphere',
    temperature: { min: Math.max(0, minTemp), max: maxTemp > minTemp ? maxTemp : minTemp + 2 },
    humidity: '85-95%',
    ventilation: true,
    separation: needsSeparation ? [
      `Separate: ${highEthyleneProducers.map(v => v.name).join(', ')}`,
      `From: ${highEthyleneSensitive.map(v => v.name).join(', ')}`
    ] : []
  };
}

export function CompatibilityAnalysis({ vegetables }: CompatibilityAnalysisProps) {
  const compatibilityResults = analyzeCompatibility(vegetables);
  const transportRec = getTransportRecommendation(vegetables);
  
  if (vegetables.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Add vegetables to see compatibility analysis</h3>
      </Card>
    );
  }
  
  if (vegetables.length === 1) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Single Vegetable Load</h3>
        <div className="flex items-center gap-2 text-compatible-green">
          <CheckCircle className="w-5 h-5" />
          <span>No compatibility issues with single vegetable type</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compatibility Results */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Compatibility Analysis
        </h3>
        
        <div className="space-y-3">
          {compatibilityResults.map((result, index) => (
            <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
              result.compatible 
                ? 'bg-compatible-green/10 border-compatible-green/20' 
                : result.severity === 'high'
                ? 'bg-incompatible-red/10 border-incompatible-red/20'
                : 'bg-warning-orange-light border-warning-orange/20'
            }`}>
              <div className="flex items-center gap-3">
                {result.compatible ? (
                  <CheckCircle className="w-5 h-5 text-compatible-green" />
                ) : (
                  <XCircle className="w-5 h-5 text-incompatible-red" />
                )}
                <span className="font-medium text-foreground">{result.pair}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{result.reason}</span>
                <Badge variant={result.compatible ? "default" : "destructive"}>
                  {result.compatible ? "Compatible" : "Incompatible"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Transport Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Transport Recommendations
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Temperature:</span>
              <span className="text-sm text-muted-foreground">
                {transportRec.temperature.min}°C - {transportRec.temperature.max}°C
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Humidity:</span>
              <span className="text-sm text-muted-foreground">{transportRec.humidity}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Truck Type:</span>
              <Badge variant="secondary" className="text-xs">
                {transportRec.type.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
          
          {transportRec.separation.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-warning-orange">⚠️ Separation Required:</h4>
              {transportRec.separation.map((instruction, index) => (
                <p key={index} className="text-xs text-muted-foreground bg-warning-orange-light p-2 rounded">
                  {instruction}
                </p>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}