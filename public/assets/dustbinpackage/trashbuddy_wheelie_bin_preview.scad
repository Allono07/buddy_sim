
$fn=64;
W=583; D=737; H=1079;
module rrbox(w,d,h,r,z){
  translate([0,0,z]) linear_extrude(height=h) offset(r=r) square([w-2*r,d-2*r],center=true);
}
module body(){
  color([0.03,0.34,0.07]) hull(){
    translate([0,0,80]) scale([1,1,1]) linear_extrude(height=1) offset(r=55) square([W-110,D-110],center=true);
    translate([0,0,990]) linear_extrude(height=1) offset(r=60) square([W*0.97-120,D*0.96-120],center=true);
  }
}
color([0.03,0.34,0.07]) body();
color([0.02,0.22,0.045]) rrbox(W*1.03,D*1.02,75,65,985);
color([0.02,0.22,0.045]) rrbox(W*0.74,D*0.62,18,45,1055);
color([0.03,0.34,0.07]) rrbox(W*0.26,D*0.09,22,14,1073);
for(x=[-220,-75,75,220]) color([0.02,0.22,0.045]) translate([x,-D/2-7,130]) cube([22,12,730],center=false);
for(s=[-1,1]) translate([s*(W/2+18),D*0.36,190]) rotate([0,90,0]) color([0.01,0.01,0.01]) difference(){cylinder(r=100,h=50); cylinder(r=55,h=51);}
for(s=[-1,1]) translate([s*(W/2+5),D*0.36,190]) rotate([0,90,0]) color([0.02,0.02,0.02]) cylinder(r=38,h=40);
translate([0,D*0.36,190]) rotate([0,90,0]) color([0.02,0.02,0.02]) cylinder(r=22,h=W*1.12);
