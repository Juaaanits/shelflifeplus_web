import { useState, useEffect } from 'react';
import { Leaf, BarChart3, Truck, AlertCircle, Menu, X, ArrowRight, CheckCircle, Shield, Zap, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VegetableInput, Vegetable } from '@/components/VegetableInput';
import { CompatibilityAnalysis } from '@/components/CompatibilityAnalysis';
import { TruckVisualizer } from '@/components/TruckVisualizer';
import { ImpactMetrics } from '@/components/ImpactMetrics';
import heroImage from '@/assets/hero-filipino-farmers.jpg';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';

// Planning parameters types
type TruckType = 'ambient' | 'refrigerated' | 'ventilated';
type TruckSize = 'small' | 'medium' | 'large';
type TravelTime = 'early_morning' | 'daytime' | 'evening' | 'night';

interface ScenarioMeta {
  truckType: TruckType;
  truckSize: TruckSize;
  truckQuantity: number;
  bestTravelTime: TravelTime;
  autoTruckQuantity: boolean;
  routeDurationHours: number;
  ambientDeltaC: number;
}

const Index = () => {
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [activeTab, setActiveTab] = useState<'input' | 'trucks' | 'analysis' | 'layout' | 'impact'>('input');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [meta, setMeta] = useState<ScenarioMeta>({
    truckType: 'refrigerated',
    truckSize: 'medium',
    truckQuantity: 1,
    bestTravelTime: 'early_morning',
    autoTruckQuantity: true,
    routeDurationHours: 3,
    ambientDeltaC: 4,
  });

  const handleVegetablesChange = (newVegetables: Vegetable[]) => {
    setVegetables(newVegetables);
  };

  const getTotalQuantity = () => vegetables.reduce((sum, veg) => sum + veg.quantity, 0);
  const capacityBySize: Record<TruckSize, number> = { small: 100, medium: 200, large: 400 };
  const getTotalCapacity = () => capacityBySize[meta.truckSize] * (meta.autoTruckQuantity ? Math.max(1, Math.ceil(getTotalQuantity() / capacityBySize[meta.truckSize])) : Math.max(1, meta.truckQuantity));
  const utilization = Math.round((getTotalQuantity() / Math.max(1, getTotalCapacity())) * 100);
  const recommendedTruckCount = Math.max(1, Math.ceil(getTotalQuantity() / capacityBySize[meta.truckSize]));
  
  const getCompatibilityStatus = () => {
    if (vegetables.length < 2) return { status: 'neutral', text: 'Add more vegetables' };
    
    // Quick compatibility check
    for (let i = 0; i < vegetables.length; i++) {
      for (let j = i + 1; j < vegetables.length; j++) {
        const veg1 = vegetables[i];
        const veg2 = vegetables[j];
        
        const ethyleneConflict = (
          (veg1.ethyleneProduction === 'high' && veg2.ethyleneSensitivity === 'high') ||
          (veg2.ethyleneProduction === 'high' && veg1.ethyleneSensitivity === 'high')
        );
        
        if (ethyleneConflict) {
          return { status: 'incompatible', text: 'Compatibility issues detected' };
        }
      }
    }
    
    return { status: 'compatible', text: 'All vegetables compatible' };
  };

  const compatibilityStatus = getCompatibilityStatus();

  const scrollToDemo = () => {
    document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scenario persistence and sharing
  const STORAGE_KEY = 'shelflife:scenario';

  // On mount: load from share URL param or localStorage
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('s');
      if (s) {
        const decoded = JSON.parse(atob(s));
        // Backward compatible: old links store array only
        if (Array.isArray(decoded)) {
          setVegetables(decoded);
          setActiveTab('analysis');
          return;
        }
        // New format: { vegetables, meta }
        if (decoded && Array.isArray(decoded.vegetables)) {
          setVegetables(decoded.vegetables);
          if (decoded.meta) setMeta((prev) => ({ ...prev, ...decoded.meta }));
          setActiveTab('analysis');
          return;
        }
      }
    } catch (e) {
      // ignore malformed share links
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Backward compatible local save
          setVegetables(parsed);
        } else if (parsed && Array.isArray(parsed.vegetables)) {
          setVegetables(parsed.vegetables);
          if (parsed.meta) setMeta((prev) => ({ ...prev, ...parsed.meta }));
        }
      }
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  // Persist scenario on change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ vegetables, meta })
      );
    } catch (e) {
      // ignore storage errors
    }
  }, [vegetables, meta]);

  const shareScenario = () => {
    try {
      const s = btoa(JSON.stringify({ vegetables, meta }));
      // Clean base URL (no existing query/hash), add share param and jump hash
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('s', s);
      url.hash = 'demo-section';
      const shareUrl = url.toString();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl);
        alert('Shareable link copied to clipboard!');
      } else {
        prompt('Copy this shareable link:', shareUrl);
      }
    } catch (e) {
      alert('Could not create share link.');
    }
  };

  // Export utilities
  const exportScenarioCSV = () => {
    try {
      const headers = ['Name','Quantity','Ethylene Production','Ethylene Sensitivity','Temp Min (°C)','Temp Max (°C)','Shelf Life (days)'];
      const rows = vegetables.map(v => [
        v.name,
        String(v.quantity),
        v.ethyleneProduction,
        v.ethyleneSensitivity,
        String(v.idealTemp.min),
        String(v.idealTemp.max),
        String(v.shelfLife)
      ]);
      const csv = [headers, ...rows].map(r => r.map(f => /[",\n]/.test(f) ? '"'+f.replace(/"/g,'""')+'"' : f).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shelflife_scenario.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Exported', description: 'Scenario downloaded as CSV.' });
    } catch (e) {
      toast({ title: 'Export failed', description: 'Could not generate CSV.' });
    }
  };

  const copyScenarioJSON = () => {
    try {
      const data = { vegetables, meta };
      const text = JSON.stringify(data, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied', description: 'Scenario JSON copied to clipboard.' });
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        toast({ title: 'Copied', description: 'Scenario JSON copied to clipboard.' });
      }
    } catch (e) {
      toast({ title: 'Copy failed', description: 'Could not copy JSON.' });
    }
  };

  const exportScenarioPDF = () => {
    try {
      const travelTimeLabel = (t: TravelTime) =>
        t === 'early_morning' ? 'Early Morning' : t === 'daytime' ? 'Daytime' : t === 'evening' ? 'Evening' : 'Night';
      const date = new Date().toLocaleString();
      const rows = vegetables
        .map(
          (v) => `
            <tr>
              <td>${v.name}</td>
              <td class="num">${v.quantity}</td>
              <td>${v.ethyleneProduction}</td>
              <td>${v.ethyleneSensitivity}</td>
              <td>${v.idealTemp.min}–${v.idealTemp.max} °C</td>
              <td class="num">${v.shelfLife}</td>
            </tr>`
        )
        .join('');
      const html = `<!doctype html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>ShelfLife+ Scenario Summary</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0a0a0a; margin: 32px; }
            h1 { margin: 0 0 4px; font-size: 22px; }
            h2 { margin: 24px 0 8px; font-size: 16px; }
            .muted { color: #666; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; }
            th { background: #f8fafc; text-align: left; }
            td.num { text-align: right; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px 24px; }
            .card { border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; }
            .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
            .brand .logo { width: 28px; height: 28px; }
            .brand .name { font-weight: 800; letter-spacing: 0.5px; color: #114034; }
            .brand .tagline { font-size: 12px; color: #16a34a; }
            .footer { position: fixed; left: 32px; right: 32px; bottom: 12px; font-size: 11px; color: #666; border-top: 1px solid #e5e7eb; padding-top: 6px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="text-align:right; margin-bottom: 8px;">
            <button onclick="window.print()" style="padding:6px 10px;">Print</button>
          </div>
          <div class="brand">
            <img src="/transparent.svg" class="logo" alt="ShelfLife+" />
            <div>
              <div class="name">SHELFLIFE+</div>
              <div class="tagline">Smarter Transport, Fresher Harvests</div>
            </div>
          </div>
          <h1>Scenario Summary</h1>
          <div class="muted">Generated ${date}</div>

          <h2>Overview</h2>
          <div class="grid card">
            <div><strong>Total Load</strong><br/>${getTotalQuantity()} units</div>
            <div><strong>Utilization</strong><br/>${isFinite(utilization) ? utilization : 0}%</div>
            <div><strong>Truck</strong><br/>${meta.truckQuantity} × ${meta.truckSize} (${meta.truckType})</div>
            <div><strong>Best Time</strong><br/>${travelTimeLabel(meta.bestTravelTime)}</div>
            <div style="grid-column: 1 / -1;"><strong>Status</strong><br/>${compatibilityStatus.text}</div>
          </div>

          <h2>Load Details</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Qty</th>
                <th>Ethylene Prod.</th>
                <th>Ethylene Sens.</th>
                <th>Temp Range</th>
                <th>Shelf Life (days)</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="6" class="muted">No vegetables added</td></tr>'}
            </tbody>
          </table>

          <div class="muted" style="margin-top:16px;">Prepared with ShelfLife+ simulator</div>
          <div class="footer">© 2024 ShelfLife+ · Smarter Transport, Fresher Harvests</div>
        </body>
        </html>`;

      const win = window.open('', '_blank');
      if (win) {
        win.document.open();
        win.document.write(html);
        win.document.close();
        setTimeout(() => {
          try { win.focus(); win.print(); } catch {}
        }, 400);
        toast({ title: 'PDF ready', description: 'Use the print dialog to save as PDF.' });
      } else {
        toast({ title: 'Popup blocked', description: 'Allow popups to generate the PDF.' });
      }
    } catch (e) {
      toast({ title: 'PDF export failed', description: 'Could not build the PDF report.' });
    }
  };

  const resetScenario = () => {
    setVegetables([]);
    setMeta({
      truckType: 'refrigerated',
      truckSize: 'medium',
      truckQuantity: 1,
      bestTravelTime: 'early_morning',
      autoTruckQuantity: true,
      routeDurationHours: 3,
      ambientDeltaC: 4,
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
    // Restore to clean base URL without query or hash
    const clean = new URL(window.location.origin + window.location.pathname);
    window.history.replaceState({}, '', clean);
  };

  // Event bridge from TraceBot (chat)
  useEffect(() => {
    const navigate = (e: any) => {
      const tab = e?.detail?.tab as typeof activeTab | undefined;
      if (tab) {
        // Scroll to simulator section and highlight briefly
        document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
        setActiveTab(tab);
        const demo = document.getElementById('demo-section');
        if (demo) {
          demo.classList.add('highlight-glow');
          setTimeout(() => demo.classList.remove('highlight-glow'), 1200);
        }
      }
    };
    const action = (e: any) => {
      const t = e?.detail?.type as string | undefined;
      if (!t) return;
      if (t === 'addSampleShipment') {
        // Simple sample preset aligned with MVP
        const sample: Vegetable[] = [
          {
            id: crypto.randomUUID(),
            name: 'Tomato',
            quantity: 80,
            ethyleneProduction: 'high',
            ethyleneSensitivity: 'low',
            idealTemp: { min: 10, max: 12 },
            shelfLife: 7,
          },
          {
            id: crypto.randomUUID(),
            name: 'Cabbage',
            quantity: 60,
            ethyleneProduction: 'low',
            ethyleneSensitivity: 'medium',
            idealTemp: { min: 0, max: 4 },
            shelfLife: 20,
          },
          {
            id: crypto.randomUUID(),
            name: 'Eggplant',
            quantity: 40,
            ethyleneProduction: 'medium',
            ethyleneSensitivity: 'high',
            idealTemp: { min: 10, max: 12 },
            shelfLife: 6,
          },
        ];
        setVegetables(sample);
        setMeta((m) => ({ ...m, truckType: 'refrigerated', truckSize: 'medium', autoTruckQuantity: true }));
        setActiveTab('analysis');
        document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (t === 'reset') {
        resetScenario();
      } else if (t === 'share') {
        shareScenario();
      }
    };
    window.addEventListener('tracebot:navigate', navigate as any);
    window.addEventListener('tracebot:action', action as any);
    return () => {
      window.removeEventListener('tracebot:navigate', navigate as any);
      window.removeEventListener('tracebot:action', action as any);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Mobile CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t border-border px-4 py-3 flex items-center gap-3">
        <Button
          onClick={scrollToDemo}
          className="flex-1 bg-brand-forest hover:bg-brand-teal text-white font-semibold"
        >
          Try Simulator
        </Button>
        <Button
          variant="outline"
          onClick={() => window.dispatchEvent(new CustomEvent('tracebot:open'))}
          className="font-semibold"
        >
          Chat
        </Button>
      </div>
      {/* Professional Mobile Header - Enlarged */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo - Enhanced with tagline */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-forest rounded-xl shadow-md">
                <img 
                  src="/transparent.svg" 
                  alt="ShelfLife+ Logo" 
                  className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-forest font-work-sans">SHELFLIFE+</span>
                </div>
                <p className="text-sm sm:text-base text-brand-teal font-medium tagline hidden sm:block italic">
                  Smarter Transport, Fresher Harvests
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-brand-forest font-medium text-base">Features</a>
              <a href="#demo-section" className="text-muted-foreground hover:text-brand-forest font-medium text-base">Simulator</a>
              <a href="#benefits" className="text-muted-foreground hover:text-brand-forest font-medium text-base">Benefits</a>
              <Button onClick={scrollToDemo} className="bg-brand-forest hover:bg-brand-teal text-white px-6 py-3 rounded-lg font-semibold shadow-lg">
                Try Simulator <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Mobile CTA + Menu */}
            <div className="flex items-center gap-2 lg:hidden">
                <Button 
                onClick={scrollToDemo}
                size="sm"
                className="bg-brand-forest hover:bg-brand-teal text-white px-4 py-2 text-sm font-semibold"
              >
                Simulator
              </Button>
              <button
                className="p-2 rounded-lg hover:bg-muted transition-smooth"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-6 border-t border-border bg-white/95 backdrop-blur-sm">
              <div className="flex flex-col space-y-3">
                <a 
                  href="#features" 
                  className="text-muted-foreground hover:text-fresh-green transition-smooth py-3 px-2 rounded-lg hover:bg-muted font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#demo-section" 
                  className="text-muted-foreground hover:text-fresh-green transition-smooth py-3 px-2 rounded-lg hover:bg-muted font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Simulator
                </a>
                <a 
                  href="#benefits" 
                  className="text-muted-foreground hover:text-fresh-green transition-smooth py-3 px-2 rounded-lg hover:bg-muted font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Benefits
                </a>
                <div className="pt-2 border-t border-border">
                  <Button 
                    onClick={() => {
                      scrollToDemo();
                      setMobileMenuOpen(false);
                    }} 
                    className="w-full btn-primary"
                  >
                    Start Free Simulator <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile-First Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-forest via-brand-forest to-brand-teal min-h-[85vh] flex items-center">
        {/* Subtle overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
        
        <div className="relative container mx-auto px-4 sm:px-6 pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-10 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content - Mobile optimized */}
            <div className="text-white space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  <Sprout className="w-4 h-4" />
                  <span>Innovation Rooted in Agriculture</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight font-work-sans">
                  Reduce Vegetable
                  <span className="block text-white/90">Waste by 40%</span>
                </h1>
                
                <p className="text-xl sm:text-2xl text-white font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 tagline sm:block italic">
                  Smarter Transport, Fresher Harvests
                </p>
                
                <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  AI-powered compatibility checking and smart transport planning 
                  for Philippine fresh produce logistics.
                </p>
              </div>
              
              {/* CTA Buttons - Mobile optimized */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0">
                <Button 
                  onClick={scrollToDemo}
                  size="lg" 
                  className="bg-white text-brand-forest hover:bg-white/90 font-semibold shadow-lg w-full sm:w-auto"
                >
                  Try Simulator Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
                <Button 
                  onClick={scrollToFeatures}
                  size="lg"
                  className="bg-white text-brand-forest hover:bg-white/90 font-semibold shadow-lg w-full sm:w-auto"
                >
                  View Features
                </Button>

              </div>

              {/* Features badges - Mobile friendly */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 pt-4">
                {[
                  { icon: CheckCircle, text: 'Ethylene Control' },
                  { icon: CheckCircle, text: 'Temperature Zones' },
                  { icon: CheckCircle, text: 'Smart Loading' }
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
                    <Icon className="w-4 h-4 text-white" />
                    <span className="text-sm sm:text-base text-white/90 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Hero Image - Mobile optimized */}
            <div className="relative order-first lg:order-last">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                <img
                  src={heroImage}
                  alt="Filipino farmers with fresh vegetables in modern agricultural logistics setting"
                  className="
                    w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover
                    transition-transform duration-500 ease-out
                    motion-safe:group-hover:scale-[1.03] motion-safe:group-hover:-translate-y-1
                    will-change-transform
                  "
                />
                <div className="absolute inset-0 bg-gradient-to-t from-fresh-green/30 via-transparent to-transparent" />
                
                {/* Floating stats card */}
                <div className="
                    absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg
                    transition-transform duration-500 ease-out motion-safe:group-hover:-translate-y-1
                  ">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-fresh-green">40%</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Less Waste</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-fresh-green">+3d</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Shelf Life</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold text-fresh-green">25%</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Cost Save</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Biologically Aware Logistics
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced agricultural science meets modern logistics technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-fresh-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-fresh-green" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Compatibility Check</h3>
              <p className="text-muted-foreground">
                AI-powered analysis prevents ethylene conflicts and incompatible vegetable pairings
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-fresh-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="w-8 h-8 text-fresh-green" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Smart Transport</h3>
              <p className="text-muted-foreground">
                Optimal truck configurations and routing based on vegetable requirements
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-fresh-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-fresh-green" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Real-time Impact</h3>
              <p className="text-muted-foreground">
                Track waste reduction, shelf life extension, and cost savings in real-time
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Simulator Section */}
      <section id="demo-section" className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Try the Simulator
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience how ShelfLife+ optimizes your vegetable logistics
            </p>
          </div>

          {/* Status Bar */}
          <div className="mb-8">
            <Card className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Load:</span>
                    <Badge variant="secondary" className="font-medium">
                      {getTotalQuantity()} units
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge 
                      variant={compatibilityStatus.status === 'compatible' ? 'default' : 
                              compatibilityStatus.status === 'incompatible' ? 'destructive' : 'secondary'}
                    >
                      {compatibilityStatus.text}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-fresh-green" />
                  <span className="text-sm text-muted-foreground">Powered by</span>
                  <span className="font-semibold text-fresh-green">AgriScience</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="ml-2">Export</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={exportScenarioCSV}>Download CSV</DropdownMenuItem>
                      <DropdownMenuItem onClick={copyScenarioJSON}>Copy JSON</DropdownMenuItem>
                      <DropdownMenuItem onClick={exportScenarioPDF}>Download PDF</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="sm" onClick={resetScenario}>
                    Reset
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'input', label: 'Add Vegetables', icon: Leaf },
                { id: 'trucks', label: 'Add Trucks', icon: Truck },
                { id: 'analysis', label: 'Compatibility', icon: AlertCircle },
                { id: 'layout', label: 'Truck Layout', icon: Truck },
                { id: 'impact', label: 'Impact Analysis', icon: BarChart3 }
              ].map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={activeTab === id ? 'default' : 'outline'}
                  onClick={() => setActiveTab(id as any)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{label.split(' ')[0]}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'input' && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <VegetableInput 
                    vegetables={vegetables} 
                    onVegetablesChange={handleVegetablesChange} 
                  />
                </div>
                
                <div>
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Start Guide</h3>
                    <div className="space-y-4 text-sm">
                      {[
                        { step: 1, title: 'Add Vegetables', desc: 'Select vegetables and quantities' },
                        { step: 2, title: 'Review Analysis', desc: 'Check compatibility issues' },
                        { step: 3, title: 'Optimize Layout', desc: 'View truck configuration' },
                        { step: 4, title: 'See Impact', desc: 'Track waste reduction' }
                      ].map(({ step, title, desc }) => (
                        <div key={step} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-fresh-green text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                            {step}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{title}</p>
                            <p className="text-muted-foreground">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  
                </div>
              </div>
            )}

            {activeTab === 'trucks' && (
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Planning Parameters</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">Truck Type</label>
                        <select
                          className="w-full border rounded-md p-2 bg-background"
                          value={meta.truckType}
                          onChange={(e) => setMeta((m) => ({ ...m, truckType: e.target.value as any }))}
                        >
                          <option value="ambient">Ambient</option>
                          <option value="refrigerated">Refrigerated</option>
                          <option value="ventilated">Ventilated</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">Truck Size</label>
                        <select
                          className="w-full border rounded-md p-2 bg-background"
                          value={meta.truckSize}
                          onChange={(e) => setMeta((m) => ({ ...m, truckSize: e.target.value as any }))}
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between gap-2 col-span-2">
                        <div>
                          <label className="block text-sm text-muted-foreground mb-1">Auto Truck Quantity</label>
                          <p className="text-xs text-muted-foreground">Compute trucks from total load and capacity</p>
                        </div>
                        <div>
                          <input
                            type="checkbox"
                            className="accent-brand-forest w-5 h-5 align-middle"
                            checked={meta.autoTruckQuantity}
                            onChange={(e) => setMeta((m) => ({ ...m, autoTruckQuantity: e.target.checked }))}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">Truck Quantity</label>
                        <input
                          type="number"
                          min={1}
                          className="w-full border rounded-md p-2 bg-background"
                          value={meta.autoTruckQuantity ? Math.max(1, Math.ceil(getTotalQuantity() / capacityBySize[meta.truckSize])) : meta.truckQuantity}
                          disabled={meta.autoTruckQuantity}
                          onChange={(e) =>
                            setMeta((m) => ({ ...m, truckQuantity: Math.max(1, Number(e.target.value || 1)) }))
                          }
                        />
                        {!meta.autoTruckQuantity && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Recommended: {recommendedTruckCount} based on current load and {meta.truckSize} capacity.
                            <button
                              type="button"
                              className="ml-2 underline text-brand-forest hover:text-brand-teal"
                              onClick={() => setMeta((m) => ({ ...m, truckQuantity: recommendedTruckCount }))}
                            >
                              Use recommended
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">Route Duration (hours)</label>
                        <input
                          type="number"
                          min={0.5}
                          step={0.5}
                          className="w-full border rounded-md p-2 bg-background"
                          value={meta.routeDurationHours}
                          onChange={(e) => setMeta((m) => ({ ...m, routeDurationHours: Math.max(0.5, Number(e.target.value || 0.5)) }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">Ambient Day-Night Delta (°C)</label>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          className="w-full border rounded-md p-2 bg-background"
                          value={meta.ambientDeltaC}
                          onChange={(e) => setMeta((m) => ({ ...m, ambientDeltaC: Math.max(0, Number(e.target.value || 0)) }))}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">Bigger delta favors night travel</p>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      Capacity: {getTotalCapacity()} units • Utilization: {isFinite(utilization) ? utilization : 0}%
                    </div>
                  </Card>
                </div>
              </div>
            )}
            {activeTab === 'analysis' && (
              <CompatibilityAnalysis
                vegetables={vegetables}
                bestTravelTime={meta.bestTravelTime}
                onChangeBestTravelTime={(val) => setMeta((m) => ({ ...m, bestTravelTime: val }))}
                routeDurationHours={meta.routeDurationHours}
                ambientDeltaC={meta.ambientDeltaC}
              />
            )}
            {activeTab === 'layout' && (
              <TruckVisualizer vegetables={vegetables} truckType={meta.truckType} truckSize={meta.truckSize} />
            )}
            {activeTab === 'impact' && (
              <ImpactMetrics vegetables={vegetables} unitPrice={100} />
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose SHELFLIFE+?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your vegetable logistics with science-backed optimization
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-fresh-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-fresh-green" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">40% Waste Reduction</h3>
                  <p className="text-muted-foreground">
                    Prevent spoilage through optimal vegetable pairing and transport conditions
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-fresh-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-fresh-green" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Smart Transport Planning</h3>
                  <p className="text-muted-foreground">
                    AI-powered recommendations for truck configuration and routing
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-fresh-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-fresh-green" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Science-Based Decisions</h3>
                  <p className="text-muted-foreground">
                    Every recommendation backed by agricultural biology research
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-fresh-green to-fresh-green-dark p-8 rounded-2xl text-white">
              <h3 className="text-2xl font-bold mb-6">Ready to Get Started?</h3>
              <p className="text-white/90 mb-8">
                Join the revolution in vegetable logistics. Start reducing waste and increasing profits today.
              </p>
              <div className="space-y-4">
                <Button 
                  onClick={scrollToDemo}
                  size="lg" 
                  className="w-full bg-white text-fresh-green hover:bg-white/90 font-semibold"
                >
                  Try Free Simulator <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
                <Button 
                  size="lg"
                  className="w-full bg-white text-fresh-green hover:bg-white/90 font-semibold"
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-foreground text-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-fresh-green rounded-lg">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">SHELFLIFE+</span>
                </div>
              </div>
              <p className="text-muted mb-6 max-w-md">
                Revolutionizing vegetable logistics through science-based compatibility 
                checking and optimized transport planning.
              </p>
              {/*
              <div className="flex gap-4">
                <Button variant="outline" size="sm" className="border-muted text-muted hover:bg-muted hover:text-foreground">
                  Download App
                </Button>
              </div>
              */}
            </div>

            

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm text-muted">
                <a href="#features" className="block hover:text-fresh-green transition-colors">Features</a>
                <a href="#demo-section" className="block hover:text-fresh-green transition-colors">Simulator</a>
                <a href="#benefits" className="block hover:text-fresh-green transition-colors">Benefits</a>
                <a href="#" className="block hover:text-fresh-green transition-colors">Pricing</a>
              </div>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm text-muted">
                <a href="#" className="block hover:text-fresh-green transition-colors">Help Center</a>
                <a href="#" className="block hover:text-fresh-green transition-colors">Contact Us</a>
                <a href="#" className="block hover:text-fresh-green transition-colors">API Docs</a>
                <a href="#" className="block hover:text-fresh-green transition-colors">Status</a>
              </div>
            </div>
          </div>

          <div className="border-t border-muted mt-12 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-muted">
              © 2024 ShelfLife+. Reducing food waste through science.
            </div>
            <div className="flex gap-6 text-sm text-muted">
              <a href="#" className="hover:text-fresh-green transition-colors">Privacy</a>
              <a href="#" className="hover:text-fresh-green transition-colors">Terms</a>
              <a href="#" className="hover:text-fresh-green transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
