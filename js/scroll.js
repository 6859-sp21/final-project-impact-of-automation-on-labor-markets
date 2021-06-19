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
function reveal_toggles() {
    document.getElementById('selectButton').style.opacity = 1;
    document.getElementById('toggle-data-buttons').style.opacity = 1;
}


ScrollTrigger.create({
    trigger: '#linechart-box',
    endTrigger: '#linechart-step6',
    start: 'top 40%',
    end: () => {
        const height = window.innerHeight;
        const chartHeight = document.querySelector('#linechart-box')
            .offsetHeight;
        return `bottom ${chartHeight + (height - chartHeight) / 2}px`;
    },
    pin: true,
    pinSpacing: false,
    markers: false,
    id: 'linechart-pin',
    onEnter: linechart_animation,
});

ScrollTrigger.create({
    trigger: '#linechart-year',
    endTrigger: '#linechart-step6',
    start: 'top 40%',
    end: () => {
        const height = window.innerHeight;
        const chartHeight = document.querySelector('#linechart-box')
            .offsetHeight;
        return `bottom ${chartHeight + (height - chartHeight) / 2}px`;
    },
    pin: true,
    pinSpacing: false,
    markers: false,
    id: 'linechart-year-pin',
});

ScrollTrigger.create({
    trigger: '#linechart-step3',
    // endTrigger: '#ridgeline-step5',
    start: 'center center',
    markers: false,
    id: 'chart-pin',
    onEnter: line_highlight_blue_red,
});

ScrollTrigger.create({
    trigger: '#linechart-step4',
    // endTrigger: '#ridgeline-step5',
    start: 'center center',
    markers: false,
    id: 'chart-pin',
    onEnter: line_highlight_yellow,
});

ScrollTrigger.create({
    trigger: '#linechart-step5',
    // endTrigger: '#ridgeline-step5',
    start: 'center center',
    markers: false,
    id: 'chart-pin',
    onEnter: line_highlight_green,
});


// ScrollTrigger.create({
//     trigger: '#text',
//     endTrigger: '#my_dataviz',
//     start: 'top 10%',
//     end: () => {
//         const height = window.innerHeight;
//         const chartHeight = document.querySelector('#text')
//             .offsetHeight;
//         return `bottom ${chartHeight + (height - chartHeight) / 2}px`;
//     },
//     pin: true,
//     pinSpacing: false,
//     markers: true,
//     id: 'chart-pin',
// });

ScrollTrigger.create({
    trigger: '#my_dataviz',
    endTrigger: '#ridgeline-step5',
    start: 'top 35%',
    end: () => {
        const height = window.innerHeight;
        const chartHeight = document.querySelector('#my_dataviz')
            .offsetHeight;
        return `bottom ${chartHeight + (height - chartHeight) / 2}px`;
    },
    pin: true,
    pinSpacing: false,
    markers: false,
    id: 'ridgeline-chart-pin',
});

ScrollTrigger.create({
    trigger: '#ridgeline-step4',
    // endTrigger: '#ridgeline-step5',
    start: 'center center',
    markers: false,
    id: 'chart-pin',
    onEnter: ridgeline_ai_to_robot,
});

ScrollTrigger.create({
    trigger: '#custom-tooltip',
    endTrigger: '#map-step6',
    start: 'top 30%',
    end: () => {
        const height = window.innerHeight;
        const chartHeight = document.querySelector('#custom-tooltip')
            .offsetHeight;
        return `bottom ${chartHeight + (height - chartHeight) / 2}px`;
    },
    pin: true,
    pinSpacing: false,
    markers: false,
    id: 'map-chart-pin',
});

// ScrollTrigger.create({
//     trigger: '#custom-tooltip-legend',
//     endTrigger: '#map-step6',
//     start: 'top 38%',
//     end: () => {
//         const height = window.innerHeight;
//         const chartHeight = document.querySelector('#custom-tooltip-legend')
//             .offsetHeight;
//         return `bottom ${chartHeight + (height - chartHeight) / 2}px`;
//     },
//     pin: true,
//     pinSpacing: false,
//     markers: false,
//     id: 'map-legend-chart-pin',
// });

ScrollTrigger.create({
    trigger: '#map-step4',
    // endTrigger: '#ridgeline-step5',
    start: 'center center',
    markers: false,
    id: 'map-robot-ai-chart-pin',
    onEnter: map_robot_to_ai,
});

ScrollTrigger.create({
    trigger: '#bottomSources',
    start: 'center center',
    markers: false,
    id: 'bottom-chart-pin',
    onEnter: reveal_toggles,
});


var stories = document.getElementsByClassName('story');
for (var i = 0; i < stories.length; i++) {
    console.log(stories[i]);
    let fadeInTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: stories[i],
            start: "center 30%",
            end: "center 27%",
            toggleActions: "play reverse restart reverse",
            scrub: true,
            markers: false,
        },
    });

    let fadeOutTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: stories[i],
            start: "center 4%",
            end: "center 0%",
            toggleActions: "play reverse restart reverse",
            scrub: true,
        },
    });

    fadeInTimeline
        .fromTo(
            stories[i],
            { y: "-20%", autoAlpha: 0 },
            { y: "0%", autoAlpha: 1 }
        );

    fadeOutTimeline.to(stories[i], {
        yPercent: 40,
        autoAlpha: 0
    });
}

// imagesLoaded(images).on('progress', updateProgress).on('always', showDemo);