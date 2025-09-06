import { TrendingDown, TrendingUp, Leaf, Banknote, Clock, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Vegetable } from './VegetableInput';

interface ImpactMetricsProps {
  vegetables: Vegetable[];
  unitPrice?: number; // price per unit in PHP
}

interface ImpactCalculation {
  withoutShelfLife: {
    wastePercentage: number;
    shelfLifeDays: number;
    estimatedLoss: number;
  };
  withShelfLife: {
    wastePercentage: number;
    shelfLifeDays: number;
    estimatedLoss: number;
  };
  savings: {
    wasteReduction: number;
    shelfLifeExtension: number;
    costSavings: number;
  };
}

function calculateImpact(vegetables: Vegetable[], unitCost: number): ImpactCalculation {
  if (vegetables.length === 0) {
    return {
      withoutShelfLife: { wastePercentage: 0, shelfLifeDays: 0, estimatedLoss: 0 },
      withShelfLife: { wastePercentage: 0, shelfLifeDays: 0, estimatedLoss: 0 },
      savings: { wasteReduction: 0, shelfLifeExtension: 0, costSavings: 0 }
    };
  }
  
  // Calculate baseline (without ShelfLife+ optimization)
  const baselineWaste = vegetables.reduce((total, veg) => {
    // Without optimization: incompatible mixing leads to accelerated spoilage
    const hasEthyleneIssues = vegetables.some(other => 
      other.id !== veg.id && 
      ((veg.ethyleneProduction === 'high' && other.ethyleneSensitivity === 'high') ||
       (other.ethyleneProduction === 'high' && veg.ethyleneSensitivity === 'high'))
    );
    
    const hasTemperatureIssues = vegetables.some(other => 
      other.id !== veg.id &&
      (veg.idealTemp.max < other.idealTemp.min || other.idealTemp.max < veg.idealTemp.min)
    );
    
    let wasteMultiplier = 0.25; // Base 25% waste
    if (hasEthyleneIssues) wasteMultiplier += 0.20; // +20% for ethylene issues
    if (hasTemperatureIssues) wasteMultiplier += 0.15; // +15% for temperature issues
    
    return total + (veg.quantity * Math.min(wasteMultiplier, 0.70)); // Cap at 70% waste
  }, 0);
  
  // Calculate with ShelfLife+ optimization
  const optimizedWaste = vegetables.reduce((total, veg) => {
    // With optimization: proper separation and storage conditions
    const baseWaste = 0.10; // Optimized base waste of 10%
    return total + (veg.quantity * baseWaste);
  }, 0);
  
  const totalQuantity = vegetables.reduce((sum, veg) => sum + veg.quantity, 0);
  const avgShelfLife = vegetables.reduce((sum, veg) => sum + veg.shelfLife, 0) / vegetables.length;
  
  const baselineLoss = baselineWaste * unitCost;
  const optimizedLoss = optimizedWaste * unitCost;
  
  return {
    withoutShelfLife: {
      wastePercentage: totalQuantity > 0 ? (baselineWaste / totalQuantity) * 100 : 0,
      shelfLifeDays: Math.max(1, avgShelfLife * 0.7), // Reduced due to poor conditions
      estimatedLoss: baselineLoss
    },
    withShelfLife: {
      wastePercentage: totalQuantity > 0 ? (optimizedWaste / totalQuantity) * 100 : 0,
      shelfLifeDays: avgShelfLife * 1.2, // Extended due to optimal conditions
      estimatedLoss: optimizedLoss
    },
    savings: {
      wasteReduction: totalQuantity > 0 ? ((baselineWaste - optimizedWaste) / totalQuantity) * 100 : 0,
      shelfLifeExtension: (avgShelfLife * 1.2) - (avgShelfLife * 0.7),
      costSavings: baselineLoss - optimizedLoss
    }
  };
}

export function ImpactMetrics({ vegetables, unitPrice = 100 }: ImpactMetricsProps) {
  const impact = calculateImpact(vegetables, unitPrice);
  const currencySymbol = '₱';
  
  if (vegetables.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-muted-foreground">Impact Analysis</h3>
        <p className="text-muted-foreground">Add vegetables to see potential impact of ShelfLife+ optimization</p>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Main Impact Comparison */}
      <Card className="p-6 bg-gradient-to-br from-fresh-green-light/10 to-fresh-green-light/5">
        <h3 className="text-lg font-semibold mb-6 text-foreground flex items-center gap-2">
          <Leaf className="w-5 h-5 text-fresh-green" />
          ShelfLife+ Impact Analysis
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Without ShelfLife+ */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-incompatible-red" />
              Without ShelfLife+
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Waste Rate:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-incompatible-red">
                    {impact.withoutShelfLife.wastePercentage.toFixed(1)}%
                  </span>
                  <Package className="w-4 h-4 text-incompatible-red" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Shelf Life:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    {impact.withoutShelfLife.shelfLifeDays.toFixed(1)} days
                  </span>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated Loss:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-incompatible-red">
                    {currencySymbol}{impact.withoutShelfLife.estimatedLoss.toFixed(2)}
                  </span>
                  <Banknote className="w-4 h-4 text-incompatible-red" />
                </div>
              </div>
            </div>
          </div>
          
          {/* With ShelfLife+ */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-compatible-green" />
              With ShelfLife+
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Waste Rate:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-compatible-green">
                    {impact.withShelfLife.wastePercentage.toFixed(1)}%
                  </span>
                  <Package className="w-4 h-4 text-compatible-green" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Shelf Life:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-compatible-green">
                    {impact.withShelfLife.shelfLifeDays.toFixed(1)} days
                  </span>
                  <Clock className="w-4 h-4 text-compatible-green" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated Loss:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-compatible-green">
                    {currencySymbol}{impact.withShelfLife.estimatedLoss.toFixed(2)}
                  </span>
                  <Banknote className="w-4 h-4 text-compatible-green" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Savings Summary */}
      <Card className="p-6 bg-gradient-to-r from-compatible-green/10 to-fresh-green-light/10 border-compatible-green/20">
        <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-compatible-green" />
          Your Savings with ShelfLife+
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-card/60 rounded-lg border border-compatible-green/20">
            <div className="text-2xl font-bold text-compatible-green">
              -{impact.savings.wasteReduction.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Waste Reduction</div>
          </div>
          
          <div className="text-center p-4 bg-card/60 rounded-lg border border-compatible-green/20">
            <div className="text-2xl font-bold text-compatible-green">
              +{impact.savings.shelfLifeExtension.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Days Extended</div>
          </div>
          
          <div className="text-center p-4 bg-card/60 rounded-lg border border-compatible-green/20">
            <div className="text-2xl font-bold text-compatible-green">
              {currencySymbol}{impact.savings.costSavings.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Cost Savings</div>
          </div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Assumption: {currencySymbol}{unitPrice.toFixed(2)} per unit
        </div>
      </Card>
    </div>
  );
}
