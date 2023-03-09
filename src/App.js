import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import './styles.css';

import axios from "axios";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];
    const FIT_OPTIONS = ['auto', 'contain', 'cover'];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
        photoId: Math.floor( Math.random()*5000 + 1),
        bgSizeOption: FIT_OPTIONS[Math.floor( Math.random()*3 )]
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const removeMoveable = () => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === selected) {
        setSelected(null);
        return {};
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  }

  const handleResizeStart = (index, e) => {
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  return (
    <main style={{ height : "100vh", width: "100vw" }}>
      <h1 className="title"><strong>Moveable</strong> demo</h1>
      <p className="title-description"><span>A demo to see the Moveable React Library capabilities</span></p>
      <button onClick={addMoveable} className='op-button add-button'>Add Moveable1</button>
      <button onClick={removeMoveable} disabled={!selected} className='op-button rem-button'>Remove Moveable</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id} 
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  photoId,
  bgSizeOption
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  const [photoURL, setPhotoURL] = useState('');

  useEffect( () => {
    if(!(photoURL.length > 0)) {
      axios(`https://jsonplaceholder.typicode.com/photos/${photoId}`).then( (response) => {
        setPhotoURL(response.data.url);
      } ).catch((error)=>{console.log(error)});
    }
  }, [photoURL] );

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();
  
  const onResize = async (e) => {

    const [handlePosX, handlePosY] = e.direction;

    if( top + e.height > parentBounds?.height ) {
      return;
    }
    if (left + e.width > parentBounds?.width) {
      return;
    }
    if(handlePosX === -1 && left/10 - e.dist[0]/10 < 0 ) {
      return;
    }
    if(handlePosY === -1 && top/10 - e.dist[1]/10 < 0 ) {
      return;
    }

    updateMoveable(id, {
      top,
      left,
      width: e.width,
      height: e.height,
      color,
    }, true);

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {

    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height) {
      newHeight = parentBounds?.height - top;
    }
    if (positionMaxLeft > parentBounds?.width) {
      newWidth = parentBounds?.width - left;
    }

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top;
    const absoluteLeft = left;

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          backgroundColor: color,
          backgroundImage: `url(${photoURL})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: bgSizeOption
        }}
        onClick={() => setSelected(id)}
      />

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          const absoluteTop = e.top + height > parentBounds.height ? parentBounds.height - height : e.top < 0 ? 0 : e.top;
          const absoluteLeft = e.left + width > parentBounds.width ? parentBounds.width - width : e.left < 0 ? 0 : e.left;
          updateMoveable(id, {
            top: absoluteTop,
            left: absoluteLeft,
            width,
            height,
            color,
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
