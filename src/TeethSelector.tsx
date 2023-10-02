import React, { useState, useRef, useEffect } from "react";
import "./TeethSelector.css";
import baseImage from "./assets/base.jpg";

type ToothProps = {
  id: number;
  x: number;
  y: number;
  selected: boolean;
  scale: number;
  svgPath: string;
  onClick: (id: number) => void;
};

const Tooth: React.FC<ToothProps> = ({
  id,
  x,
  y,
  selected,
  scale,
  svgPath,
  onClick,
}) => {
  return (
    <>
      <text x={x * scale + -28} y={y * scale + 35} className="tooth-id">
        {id}
      </text>
      <image
        className="tooth"
        x={x * scale}
        y={y * scale}
        height={85 * scale}
        width={85 * scale}
        href={selected ? svgPath : ""}
        onClick={() => onClick(id)}
      />
    </>
  );
};

const TeethSelector: React.FC = () => {
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [scale, setScale] = useState(1);
  const imageRef = useRef<HTMLImageElement>(null);

  const toggleTooth = (id: number) => {
    setSelectedTeeth((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((toothId) => toothId !== id)
        : [...prevSelected, id]
    );
  };

  useEffect(() => {
    const updateScale = () => {
      if (imageRef.current) {
        const { naturalWidth, clientWidth } = imageRef.current;
        setScale(clientWidth / naturalWidth);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  const teethCoordinates = [
    { id: 18, x: 57, y: 390, svgPath: "./tooth18.png" },
    { id: 17, x:68, y: 305, svgPath: "./tooth17.png" },
  ];

  return (
    <div className="main">
      <div className="teeth-container">
        <img
          ref={imageRef}
          src={baseImage}
          width={20}
          alt="Base teeth image"
          className="base-image"
        />
        <svg className="overlay">
          {teethCoordinates.map(({ id, x, y, svgPath }) => (
            <Tooth
              key={id}
              id={id}
              x={x}
              y={y}
              scale={scale}
              svgPath={svgPath}
              selected={selectedTeeth.includes(id)}
              onClick={toggleTooth}
            />
          ))}
        </svg>
      </div>
      <div className="selected-info">
        <h3>Selected Teeth</h3>
        <ul>
          {selectedTeeth.map((id) => (
            <li key={id}>Tooth : {id}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TeethSelector;
