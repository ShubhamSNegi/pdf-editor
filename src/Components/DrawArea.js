import React, { useState, useEffect, useRef } from 'react';
import Immutable from 'immutable';

function DrawArea(props) {
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isCrosshair, setIsCrosshair] = useState(false);
  // const drawAreaEl = useRef(null);
  const drawAreaEl = props.drawAreaRef;

  useEffect(() => {
    const handleMouseUp = () => {
      setIsCrosshair(false);
      setIsDrawing(false);
    };

    const drawAreaElement = document.getElementById("drawArea");
    if (drawAreaElement) {
      drawAreaElement.addEventListener("mouseup", handleMouseUp);

      props.getBounds({
        x: drawAreaEl.current.getBoundingClientRect().left,
        y: drawAreaEl.current.getBoundingClientRect().bottom,
      });

      return () => {
        drawAreaElement.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, []);

  const handleMouseDown = (e) => {
    if (e.button !== 0) {
      return;
    }
    const point = relativeCoordinatesForEvent(e);
    let obj = {
      arr: [point],
      page: props.page,
      type: "freehand",
    };
    setLines(prevlines => [...prevlines, obj]);
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) {
      return;
    }
    const point = relativeCoordinatesForEvent(e);
    let last = lines.pop();
    last.arr.push(point);
    setLines(prevlines => [...prevlines, last]);
  };

  const relativeCoordinatesForEvent = (e) => {
    const boundingRect = drawAreaEl.current.getBoundingClientRect();
    return new Immutable.Map({
      x: e.clientX - boundingRect.left,
      y: e.clientY - boundingRect.top,
    });
  };

  const addMouseDown = () => {
    setIsCrosshair(true);
    document.getElementById("drawArea").addEventListener("mousedown", handleMouseDown, { once: true });
  };

  return (
    <>
      <div
        id="drawArea"
        ref={drawAreaEl}
        style={isCrosshair ? { cursor: "crosshair", position: "relative", overflow: "hidden" } : { cursor: props.cursor, position: "relative", overflow: "hidden" }}
        onMouseMove={handleMouseMove}
      >
        {props.children}
        <Drawing lines={lines} page={props.page} />
        {props.images.map((image, index) => (
          image.page === props.page && <DrawImage key={index} image={image} drawAreaEl={drawAreaEl} />
      ))}
      </div>
    </>
  );
}

function DrawImage({ image, drawAreaEl }) {
  const [position, setPosition] = useState({ x: image.x, y: image.y });

  useEffect(() => {
    const handleResize = () => {
      const drawAreaRect = drawAreaEl.current.getBoundingClientRect();
      const drawAreaWidth = drawAreaRect.width;
      const drawAreaHeight = drawAreaRect.height;
      const newX = Math.max(0, Math.min(image.x, drawAreaWidth - image.width));
      const newY = Math.max(0, Math.min(image.y, drawAreaHeight - image.height));
      setPosition({ x: newX, y: newY });
    };

    handleResize(); // Initial resize to calculate position
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [image, drawAreaEl]);

  return (
    <img
      src={image.image}
      style={{
        position: "absolute",
        left: 10 + "px", // harcoded value
        top: 10 + "px", // harcoded value
        zIndex: 2,
        visibility: position.x === undefined || position.y === undefined ? "hidden" : "visible",
      }}
      alt={`image_${image.id}`}
    />
  );
}

function Drawing({ lines, page }) {
  return (
    <svg className="drawing" style={{ zIndex: 10 }}>
      {lines.map((line, index) => (
        <DrawingLine key={index} line={line} page={page} />
      ))}
    </svg>
  );
}

function DrawingLine({ line, page }) {
  const pathData = "M " +
    line.arr
      .map(p => {
        return `${p.get('x')},${p.get('y')}`;
      })
      .join(" L ");

  if (line.page === page) {
    return <path className="path" d={pathData} />;
  }
  return null;
}

export default DrawArea;
