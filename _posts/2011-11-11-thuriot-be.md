---
layout: page
title: Thuriot.be
date: 2011-11-11 15:00:00
categories: [Projects]
---

*Note: I've switched systems since writing this page. My site is currently running on [Jekyll](http://jekyllrb.com/) with a self-made theme. Before this, I was running on a self-built cms.*

----

This site is completely dynamic. It has a MySQL database running behind it. The index.php file functions as a proxy, handling all the requests. It parses the url, asks the database manager for the correct info and displays it.

[![Main view](//cdn.thuriot.be/Site/Site1_thumb.png)](//cdn.thuriot.be/Site/Site1.png)

The panel has 4 main sections. The first one is the start page. It will inform you how many pages and users are created at the current time. It will also let you know as which user you are currently logged in.

[![Page management](//cdn.thuriot.be/Site/Site2_thumb.png)](//cdn.thuriot.be/Site/Site2.png)

The second part is the page manager. It's written in a combination of Javascript (Front-end) and PHP (Back-end). The idea behind this site is that each page belongs to a certain subject. For instance, the page at "http://thuriot.be/Projects/thuriot-be" is called "thuriot-be" and belongs to the subject "Projects". When there is only a subject given and no page name, e.g. "http://thuriot.be/Projects", the page name will automatically be the "index" page of that subject.

[![Button management](//cdn.thuriot.be/Site/Site3_thumb.png)](//cdn.thuriot.be/Site/Site3.png)

The third part is the button manager. The two middle buttons of this site are also dynamic. By using this page, you can configure their link and name.&nbsp; The correct images will then be generated and the links stored in the database. This allows for a highly adaptable template.

[![User management](//cdn.thuriot.be/Site/Site4_thumb.png)](//cdn.thuriot.be/Site/Site4.png)

The site also has a user manager. It is possible to create multiple users, letting more than one person work on the site without having to share accounts. User accounts can also be deleted, but for obvious reasons, a normal user can only delete its own account.

[![Site border](//cdn.thuriot.be/Site/Site5_thumb.png)](//cdn.thuriot.be/Site/Site5.png)

Finally, after the user has logged in, when browsing normal pages on the site, hovering over the editable part will show a black border. When you double click when this border is showing, it will automatically go to the page manager and open the current page. This enables you to quickly start editing an existing page.
