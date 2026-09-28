import { useRef } from "react";

export default function MindMap({ data }) {
  const svgRef = useRef(null);

  const downloadAsPNG = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      canvas.width = 800;
      canvas.height = 400;
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = 'mindmap.png';
        a.click();
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
      });
    };
    img.src = url;
  };

  if (!data || !data.nodes) {
    return (
      <div className="w-full max-w-3xl mx-auto h-48 border border-meet-line bg-meet-card rounded-lg flex items-center justify-center mt-4 shadow-meet-sm">
        <p className="text-meet-muted italic">Mind Map will appear after processing completes.</p>
      </div>
    );
  }

  const lineStroke = "rgba(139, 148, 168, 0.45)";
  const textFill = "#8B94A8";
  const childFill = "#252B3B";

  return (
    <div className="w-full max-w-3xl mx-auto mt-4 rounded-lg border border-meet-line shadow-meet-sm p-6 relative overflow-hidden flex flex-col items-center justify-center bg-meet-card h-[500px]">
      <div className="absolute top-4 right-4 flex space-x-2 z-10">
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center bg-meet-input border border-[rgba(109,95,213,0.3)] rounded-lg shadow-meet-sm text-meet-purpleLight hover:bg-meet-purple/20 font-bold transition"
        >
          +
        </button>
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center bg-meet-input border border-[rgba(109,95,213,0.3)] rounded-lg shadow-meet-sm text-meet-purpleLight hover:bg-meet-purple/20 font-bold transition"
        >
          −
        </button>
      </div>

      <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 400" className="opacity-95">
        <g transform="translate(400, 200)">
          {data.nodes.map((node, i) => {
            const angle = (i / data.nodes.length) * Math.PI * 2;
            const x = Math.cos(angle) * 180;
            const y = Math.sin(angle) * 120;
            return (
              <g key={`edge-${i}`}>
                <line x1="0" y1="0" x2={x} y2={y} strokeWidth="3" stroke={lineStroke} />
                {node.children &&
                  node.children.map((_, j) => {
                    const isRightSide = x >= 0;
                    const cx = x + (isRightSide ? 140 : -140);
                    const cy = y + (j - (node.children.length - 1) / 2) * 35;
                    return (
                      <line key={`childedge-${i}-${j}`} x1={x} y1={y} x2={cx} y2={cy} strokeWidth="2" stroke={lineStroke} />
                    );
                  })}
              </g>
            );
          })}

          {data.nodes.map((node, i) => {
            const angle = (i / data.nodes.length) * Math.PI * 2;
            const x = Math.cos(angle) * 180;
            const y = Math.sin(angle) * 120;
            return (
              <g key={`children-${i}`}>
                {node.children &&
                  node.children.map((child, j) => {
                    const isRightSide = x >= 0;
                    const cx = x + (isRightSide ? 140 : -140);
                    const cy = y + (j - (node.children.length - 1) / 2) * 35;
                    return (
                      <g key={`childnode-${i}-${j}`} transform={`translate(${cx}, ${cy})`}>
                        <rect x="-55" y="-14" width="110" height="28" rx="4" fill={childFill} stroke="rgba(109,95,213,0.25)" strokeWidth="1" />
                        <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill={textFill}>
                          {child}
                        </text>
                      </g>
                    );
                  })}
              </g>
            );
          })}

          {data.nodes.map((node, i) => {
            const angle = (i / data.nodes.length) * Math.PI * 2;
            const x = Math.cos(angle) * 180;
            const y = Math.sin(angle) * 120;

            const stroke = "rgba(109,95,213,0.45)";
            const fill = "#252B3B";
            const labelFill = "#7B93FF";

            return (
              <g key={`node-${i}`} transform={`translate(${x}, ${y})`}>
                <rect x="-60" y="-20" width="120" height="40" rx="20" strokeWidth="2" fill={fill} stroke={stroke} />
                <text x="0" y="5" textAnchor="middle" fontSize="12" fontWeight="bold" fill={labelFill}>
                  {node.label}
                </text>
              </g>
            );
          })}

          <g>
            <rect x="-80" y="-30" width="160" height="60" rx="8" strokeWidth="2" fill="#6D5FD5" stroke="rgba(109,95,213,0.5)" />
            <text x="0" y="5" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
              {data.center}
            </text>
          </g>
        </g>
      </svg>

      <div className="absolute bottom-4 right-4">
        <button
          type="button"
          onClick={downloadAsPNG}
          className="px-4 py-2 bg-meet-input border border-meet-line rounded-lg shadow-meet-sm text-sm font-semibold text-meet-muted hover:text-meet-text hover:border-[rgba(109,95,213,0.3)] transition"
        >
          Download as PNG
        </button>
      </div>
    </div>
  );
}
