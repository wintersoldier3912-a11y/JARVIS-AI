import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { DomainModule } from '../types';

interface Props {
  activeDomain: DomainModule;
}

const RadarStats: React.FC<Props> = ({ activeDomain }) => {
  
  const getData = (domain: DomainModule) => {
    // Base stats
    let data = [
      { subject: 'Logic', A: 60, fullMark: 100 },
      { subject: 'Creativity', A: 60, fullMark: 100 },
      { subject: 'Tech', A: 60, fullMark: 100 },
      { subject: 'Strategy', A: 60, fullMark: 100 },
      { subject: 'Bio', A: 60, fullMark: 100 },
      { subject: 'Ethics', A: 100, fullMark: 100 }, // Always high
    ];

    // Boost stats based on domain
    switch (domain) {
      case DomainModule.TACTICAL:
        data[3].A = 100; // Strategy
        data[0].A = 90; // Logic
        break;
      case DomainModule.ENGINEERING:
        data[2].A = 100; // Tech
        data[0].A = 95; // Logic
        break;
      case DomainModule.CREATIVE:
        data[1].A = 100; // Creativity
        break;
      case DomainModule.BIO_SCIENCES:
        data[4].A = 100; // Bio
        data[0].A = 85;
        break;
      case DomainModule.GLOBAL:
        data[3].A = 85;
        data[1].A = 80;
        break;
      default:
        data = data.map(d => ({ ...d, A: 75 }));
        data[5].A = 100;
        break;
    }
    return data;
  };

  return (
    <div className="w-full h-48 opacity-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getData(activeDomain)}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#00f0ff', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
          <Radar
            name="Capabilities"
            dataKey="A"
            stroke="#00f0ff"
            strokeWidth={2}
            fill="#00f0ff"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarStats;