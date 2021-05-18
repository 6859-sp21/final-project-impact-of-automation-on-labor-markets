gsap.registerPlugin(ScrollTrigger);

// const images = gsap.utils.toArray('img');
// const loader = document.querySelector('.loader--text');
// const updateProgress = (instance) =>
//     loader.textContent = `${Math.round(instance.progressedCount * 100 / images.length)}%`;

// const showDemo = () => {
//     document.body.style.overflow = 'auto';
//     document.scrollingElement.scrollTo(0, 0);
//     gsap.to(document.querySelector('.loader'), { autoAlpha: 0 });

//     gsap.utils.toArray('section').forEach((section, index) => {
//         const w = section.querySelector('.wrapper');
//         if (w) {
//             const [x, xEnd] = index % 2 ? ['100%', (w.scrollWidth - section.offsetWidth) * -1] : [w.scrollWidth * -1, 0];
//             gsap.fromTo(w, { x }, {
//                 x: xEnd,
//                 scrollTrigger: {
//                     trigger: section,
//                     scrub: 0.5
//                 }
//             });
//         }
//     });
// };

//This pins the SVG chart wrapper when it hits the center of the viewport
//and releases the pin when the final textbox meets the bottom of the chart
//we use a function to define the end point to line up the bottom of the
//text box with the bottom of the chart
ScrollTrigger.create({
    trigger: '#linechart-box',
    endTrigger: '#linechart-step2',
    start: 'center center',
    end: () => {
        const height = window.innerHeight;
        const chartHeight = document.querySelector('#linechart-box')
            .offsetHeight;
        return `bottom ${chartHeight + (height - chartHeight) / 2}px`;
    },
    pin: true,
    pinSpacing: false,
    markers: true,
    id: 'chart-pin',
    onEnter: linechart_animation,
});

// imagesLoaded(images).on('progress', updateProgress).on('always', showDemo);