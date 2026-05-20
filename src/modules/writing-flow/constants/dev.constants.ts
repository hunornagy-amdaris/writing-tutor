export const DEV_CHEAT_TRIGGER = 'devdev';

export type DevSampleEssay = {
  id: string;
  label: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Polished';
  text: string;
};

export const DEV_SAMPLE_ESSAYS: readonly DevSampleEssay[] = [
  {
    id: 'beginner',
    label: 'Beginner — lots of errors',
    level: 'Beginner',
    text: `Many people think daylight saving time should be abolish. I am agree with this opinion because it is very confusing for everybody. When we change the clock twice a year, people get tired and they make many mistake at work.

In first place, daylight saving time is not useful in modern life. Long time ago people used candle and lamp so saving daylight was important. But today we have electricity everywhere. We work inside the building with light all day. So this old idea is no need anymore.

Secondly, the change of clock is bad for health. My mother she always feel sick for one week after the change. Doctors says that heart attack and accidents are more when the clock change. This is dangerous for the society and goverment must to protect the people.

On other hand, some peoples says that daylight saving give more time in evening to do sport and shopping. But i think this is not a strong reason. We can do sport and shopping any time, the clock is not important.

In conclusion, daylight saving time is old idea and should be stop. The goverment must to choose one time and keep it for ever. This will make life more easy for everyone.`,
  },
  {
    id: 'intermediate',
    label: 'Intermediate — some grammar slips',
    level: 'Intermediate',
    text: `Daylight saving time has been debated for many years. Some people argue that it should be abolished because it disrupts sleep patterns and confuses schedules. Others believe it still serves a useful purpose by extending evening daylight and saving energy.

Those in favour of abolishing daylight saving time point to research showing that the time change causes tiredness and even health problems in the days following the switch. They also argue that modern lifestyles, with artificial lighting and indoor work, make the original justification for daylight saving largely irrelevant. In addition, the bi-annual clock change creates inconvenience for businesses that operate across time zones.

On the other hand, supporters claims that longer evenings encourage outdoor activities and reduce electricity use during peak hours. Retail and tourism industries often benefits from extended daylight, as people are more likely to shop or travel after work. Furthermore, some studies suggest that crime rates drops when there is more daylight in the evening.

In my opinion, the disadvantages of daylight saving time outweigh the benefits in todays connected world. While the idea was sensible a hundred years ago, the small energy savings no longer justifies the disruption it causes to peoples wellbeing. A permanent standard time would simplify life for everyone and remove the twice-yearly shock to our internal clocks.

To conclude, although there are arguments on both sides, I believe daylight saving time should be abolished and replaced with a single year-round time.`,
  },
  {
    id: 'advanced',
    label: 'Advanced — minor issues',
    level: 'Advanced',
    text: `Daylight saving time remains one of the most contested timekeeping conventions of the modern era. Proponents argue that shifting the clock forward in spring preserves evening daylight, encourages outdoor activity, and reduces electricity consumption during peak hours. Critics, however, contend that the practice is an outdated relic which produces measurable harm to public health and economic productivity.

Those who defend daylight saving point to its origins as a wartime measure to conserve fuel. Today, advocates highlight benefits to tourism, retail, and recreation: longer evenings extend the trading day for many businesses and allow families to enjoy outdoor leisure after work. Supporters also cite studies linking daylight saving to small but consistent reductions in evening traffic accidents and certain categories of crime.

Opponents counter that the supposed benefits are increasingly negligible. Modern electrical grids and lighting technology mean that the original energy-saving rationale no longer applies, and several peer-reviewed studies have linked the spring transition to elevated rates of heart attacks, workplace accidents, and depressive episodes. Furthermore, the twice-yearly disruption imposes hidden costs on industries that must reconcile schedules across time zones.

In my view, the balance of evidence now favours abolition. The marginal advantages of shifted daylight are outweighed by the health and productivity costs of repeatedly resetting our internal clocks. A permanent standard time, applied consistently within each region, would deliver the predictability that modern, interconnected societies require without sacrificing any meaningful benefit.`,
  },
  {
    id: 'polished',
    label: 'Polished — near-native, very few errors',
    level: 'Polished',
    text: `Few timekeeping conventions provoke as much disagreement as daylight saving time. Twice a year, much of the world shifts its clocks in pursuit of brighter evenings, and twice a year a familiar argument resurfaces: does the practice still earn its place in modern life, or has its moment passed?

Advocates point to the cheerful arithmetic of summer evenings. A later sunset, they argue, lifts the mood of city centres, lengthens the trading day for hospitality and retail, and nudges people outdoors after work. Some studies even credit the shift with marginal reductions in evening crime and traffic incidents, suggesting that the convention quietly earns its keep.

Critics, however, see a tradition that has outlived its rationale. Originally introduced to conserve fuel during wartime, daylight saving offers negligible energy benefits in an era of efficient lighting and round-the-clock indoor work. Worse, the spring transition has been linked in peer-reviewed research to a measurable spike in heart attacks, workplace accidents, and disrupted sleep — a recurring price paid by millions for a vanishingly small public gain.

On balance, the costs now appear to dwarf the benefits. The convenience of longer evenings cannot reasonably justify the biological toll of yanking entire populations out of rhythm twice a year, particularly when a permanent standard time would deliver predictability without sacrificing daylight where it is most needed. The honest course is to thank daylight saving for its century of service and quietly retire it.`,
  },
];
